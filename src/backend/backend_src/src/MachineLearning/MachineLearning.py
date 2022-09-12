import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, date
from copy import deepcopy
import datetime
import pandas as pd
import json
import tensorflow as tf
from keras.models import Sequential, Model
from keras.optimizers import Adam
from keras.layers import Dropout, LSTM, Dense, Input, RepeatVector, TimeDistributed
from pandas import DataFrame
from sklearn.preprocessing import MinMaxScaler
from .ModelData import ModelData,data,Scalers


'''
MachineLearning Class

This class will train a LSTM model which will make
historical and future stock price predictions
for each stock.  The main method to be called
is StockPriceLearning
'''
class MachineLearning:

    def __init__(self, influx_client, query_helper):
        self.influx_client = influx_client
        self.query_helper = query_helper
        self.features = [
            "Momentum",
            "ROC",
            "RSI",
            "SMA",
            "WMA",
            "stock_prices"
        ]

    '''
    Function to perform the query of all features of stock data

    Params:
        ticker --> stock to perform query with
    
    Returns:
        dataframes --> a list of dataframes for each feature
    '''
    def _query_data(self, ticker):
        data = {}
        dataFrames = {}

        # loop through supported features, make the query, make a dataframe
        # each feature needs a seperate frame since their dates do not align exactly
        # later, we will resample each frame, then combine so they all align well
        for field in self.features:
            data.update({f'{field}': {
                    'time': [],
                    f'{field}': [],
            }})
            # parse the returned data point, (time and price)
            for point in self.query_helper.get_time_ticks(ticker, field):
                data[f'{field}']['time'].append(str(datetime.datetime.fromtimestamp(point[0]).strftime('%Y-%m-%d %H:%M:%S'))) 
                data[f'{field}'][f'{field}'].append(point[1])

            data_json = json.dumps(data[f'{field}'], sort_keys=True, indent=4, default=str)
            dataFrames[f'{field}'] = pd.read_json(data_json)
        # print(dataFrames)
        # return the list of dataframes
        return dataFrames

    '''
    begin by developing a pandas dataframe to hold all time and feature data.
    This will take a precision argument to determine the resample rate

    Params: 
        ticker --> ticker to perform machine learning on
        precision --> determines rate of resample for dataframe

    Returns:
        dataframe --> complete resampled dataframe of all features, sorted by
            date spaced by prescision param
    '''
    def _preprocessed_dataFrame(self, ticker, precision):

        # initially query data
        dataFrames = self._query_data(ticker)
        res = []

        # loop through each df in the df collection, and resample based on specified precision
        for key in dataFrames.keys():
            dataFrames[key]['time'] = pd.to_datetime(dataFrames[key]['time'])
            dataFrames[key].index = dataFrames[key].pop('time')
            if (precision == 'H'):
                res.append(pd.DataFrame(dataFrames[key].resample('60min').mean()).fillna(0))
            else:
                res.append(pd.DataFrame(dataFrames[key].resample('D').mean()).fillna(0))


        # concat all the resampled dataframes to form a single df in the following form:
        # Date(index):     Feature1:       Feature2:       ...         Price:
        #   ...             ...             ...            ...          ....
        
        r = pd.concat(res, axis=1, join='inner')

        j = 0
        k = 0

        # loop through each column in the dataframe
        # replace all 0 or NaN values with closest value in the column
        for i,rows in r.iterrows():
            index_num = r.index.get_loc(i)
            for key in r.keys():
                while (r.loc[i, key] == 0):
                    
                    ## check back first, dont go below zero
                    if ((index_num - j) > 0):
                        j += 1
                        if (r.iloc[index_num-j].at[key] != 0):
                            r.loc[i, key] = r.iloc[index_num-j].at[key]
                            break
                    else:
                        k += 1
                        if (r.iloc[index_num+k].at[key] != 0):
                            r.loc[i, key] = r.iloc[index_num+k].at[key]
                            break
                j = 0
                k = 0

        # return the final concatenated dataframe
        return r

    '''
    Use the featured and scaled dataframe to parse and return model data fed to LSTM model

    Params: 
        dataFrame --> pre processed dataframe with all features and dates
        n_past, n_future --> represents the amount of past days to make n_future predictions
        split --> determine the data split of train/validation/test
            (i.e) split=[85,90] means 85% training, 5% validation, 10% test


    Returns:
        Dates --> Years worth of dates, seperated by precision
        modelData --> X/YTrain, X/YValidation, X/YTest
        scalers --> MinMaxScalers needed for inverse transform of data
        predictionData --> np array to be used when making predictions

    '''

    def _model_data(
        self, 
        dataFrame, 
        n_past=14, 
        n_future=1,
        split=[85,90]
        ):
        
        dates = dataFrame.index
        colsX = list(dataFrame)[0:len(dataFrame.columns)-1]
        colsY = list(dataFrame)[-1]
        
        df_train = dataFrame.reset_index(level=0)
        df_train_x = df_train[colsX].astype(float)
        df_train_Y = df_train[colsY].astype(float)
        df_train_Y = np.array(df_train_Y).reshape(-1,1)


        scaler_x = MinMaxScaler()
        scaler_y = MinMaxScaler()

        df_train_x_scaled = scaler_x.fit_transform(df_train_x)
        df_train_y_scaled = scaler_y.fit_transform(df_train_Y)

        trainX = []
        trainY = []

        n_future = n_future
        n_past = n_past


        for i in range(n_past, (len(df_train_y_scaled)) - n_future + 1):
            trainX.append(df_train_x_scaled[i - n_past:i, 0:df_train_x_scaled.shape[1]])
            trainY.append(df_train_y_scaled[i + n_future - 1:i + n_future, 0])
        trainX, trainY = np.array(trainX), np.array(trainY)

        q1 = int(len(trainX) * (split[0]/100))
        q2 = int(len(trainX) * (split[1]/100))

        xTrain, yTrain = trainX[:q1], trainY[:q1]
        xVal, yVal = trainX[q1:q2], trainY[q1:q2]
        xTest, yTest = trainX[q2:], trainY[q2:]

        return ModelData(
            Dates=dates,
            modelData=data(
                Xtrain=xTrain,
                Ytrain=yTrain,
                XVal=xVal,
                YVal=yVal,
                XTest=xTest,
                YTest=yTest
            ),
            scalers=Scalers(
                scalerX=scaler_x,
                scalerY=scaler_y
            ),
            predictionData=trainX
        )

    '''
    Use the Model data to create, configure, train, fit, and compile the model.

    Params:
        data --> contains all data needed by the model
        precision --> rate at which dataFrame was resampled
    
    Returns:
        model --> LSTM model that will be used for future price predictions

    '''

    def _create_model(self, data:data, precision):
        model = Sequential()    
        model.add(LSTM(64, activation='relu', input_shape=(data.Xtrain.shape[1], data.Xtrain.shape[2]), return_sequences=False))
        # model.add(LSTM(32, activation='relu',return_sequences=False))
        # model.add(Dropout(0.1))
        model.add(Dense(32))
        model.add(Dense(data.Ytrain.shape[1]))
        model.compile(optimizer='adam', loss='mse')

        
        # model.fit(trainX,  trainY, epochs=5,batch_size=1, validation_split=0.1, verbose=1)
        model.fit(data.Xtrain,  data.Ytrain, epochs=20,batch_size=32 if precision == 'H' else 2, validation_data=(data.XVal, data.YVal), verbose=0)

        return model


    '''
    Use the created model to make historical predictions and future predictions.

    Params:
        dataFrame --> pre processed scaled data dataframe
        model --> the created model
        data --> all model data
        n_future --> number of future days to predict
        n_past --> number of past days to use for prediction
        precision --> date vector precision

    Returns:
        original --> dataframe of original data
        historical --> dataframe of historical price predictions
        future --> dataframe of future price predictions
    '''
    def _make_predictions(
        self,
        dataFrame:DataFrame,
        model:Model,
        data:ModelData,
        n_future,
        n_past,
        precision
        ):
        n_future =  n_future*24 if precision == 'H' else n_future
        predict = model.predict(data.predictionData, verbose=0)
        forecast_dates = pd.date_range(list(data.Dates)[-1], periods=n_future, freq='60min' if precision == 'H' else '1D').tolist()
        forecast = model.predict(data.predictionData[-n_future:], verbose=0)
        forecast_copies = np.repeat(forecast, data.modelData.Ytrain.shape[1], axis=-1)

        y_pred_future = data.scalers.y.inverse_transform(forecast_copies)[:,0]        
        
        y_pred_historic = data.scalers.y.inverse_transform(predict)[:,0]
        y_pred_future = y_pred_future - ((y_pred_future[0] - dataFrame['stock_prices'][-1]))

        forecast_dates_p = []
        for time_i in forecast_dates:
            forecast_dates_p.append(time_i.date())
        
        df_forecast = pd.DataFrame({'Date': np.array(forecast_dates_p), 'Price': y_pred_future})
        df_forecast['Date'] = pd.to_datetime(df_forecast['Date'])
        original = pd.DataFrame({'Date': dataFrame.index, 'Price': dataFrame['stock_prices']})
        historicalPredictions = pd.DataFrame({'Date': dataFrame.index[n_past:], 'Price': y_pred_historic})

        return original, historicalPredictions, df_forecast

    '''
    Plot a quick graph of results from model for debugging
    '''
    def _plot_results(self, original, historical, future):
        plt.plot(original['Date'], original['Price'])
        plt.plot(historical['Date'], historical['Price'])
        plt.plot(future['Date'], future['Price'])
        plt.legend(['original', 'predicted', 'future_prediction'])
        plt.show()

    '''
    Take the prediction dataframes, and send them to influxdb. (also can plot for debugging)

    Params: 
        ticker --> ticker to perform ops on
        full_data --> bool to specify if we want to write historical and future predictions
            True = historical and future
            False = future only
        original --> original dataframe
        historical --> historical predictions dataframe
        future --> future predictions dataframe
        plot --> bool to determine if a plot should be shown (for debugging)
    '''
    def _handle_predictions(
        self, 
        ticker, 
        full_data, 
        original, 
        historical, 
        future, 
        plot
        ):

        if (plot):
            self._plot_results(
                original=original,
                historical=historical,
                future=future
            )

        if (full_data):
            df =  pd.DataFrame({
                'Date': np.concatenate((historical['Date'],future['Date']), axis=None), 
                'Price': np.concatenate((historical['Price'],future['Price']),axis=None)
                })

            for i,rows in df.iterrows():
                self.influx_client.write_data(["MachineLearning,stock={ticker} Price={Price} {time}".format(
                            ticker=ticker,
                            Price=df.iloc[i].at['Price'],
                            time=int(datetime.datetime.timestamp(df.iloc[i].at['Date']))
                        )])
        else:
            df =  pd.DataFrame({
                'Date': future['Date'], 
                'Price': future['Price']
                })
            for i,rows in df.iterrows():
                self.influx_client.write_data(["MachineLearning,stock={ticker} Price={Price} {time}".format(
                            ticker=ticker,
                            Price=df.iloc[i].at['Price'],
                            time=int(datetime.datetime.timestamp(df.iloc[i].at['Date']))
                        )])
    
    '''
    Main Method.
    This will be called for each individual stock, and perform machine learning
    to output future and historical price predictions

    Params:
        ticker --> ticker to perform learning on
        precision --> the space of the output time vector
            Options are 'D' for Daily and 'H' for hourly (default is 'D')
        n_future --> number of days into the future to predict (default is 30)
        plot --> boolean to display plot, only use when debugging
        full_data --> boolean to decide to write historical and future predictions
            to database or only future (true = future and historical, false = only future)
    '''

    def StockPriceLearning(
        self,
        ticker, 
        precision='D', 
        n_future=30, 
        plot=False,
        full_data=False
        ):
        
        # begin by seeding tf
        tf.random.set_seed(7)
        n_past = 14

        # create a preprocessed df expected by the model
        dataFrame = self._preprocessed_dataFrame(
            ticker=ticker, 
            precision=precision
        )

        # split the dataframe into scaled training and testing sets for model to use
        data = self._model_data(
            dataFrame=dataFrame,
            n_past=n_past,
            n_future=1,
            split=[85,90]
        )

        # actually create and train the LSTM model
        model = self._create_model(
            data=data.modelData,
            precision=precision
        )

        # gather original data, along with historical and future predictions
        # made by the model
        original, historical, future = self._make_predictions(
            dataFrame=dataFrame,
            model=model,
            data=data,
            n_future=n_future,
            n_past=n_past,
            precision=precision
        )

        #  send those predictions to influx db
        self._handle_predictions(
            ticker=ticker,
            full_data=full_data,
            original=original,
            historical=historical,
            future=future,
            plot=plot
        )





