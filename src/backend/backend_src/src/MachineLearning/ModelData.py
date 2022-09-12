
# custom type to hold all training data
class data:
    
    def __init__(self, Xtrain, Ytrain, XVal, YVal, XTest, YTest):
        self.Xtrain = Xtrain
        self.Ytrain = Ytrain
        self.XVal = XVal
        self.YVal = YVal
        self.XTest = XTest
        self.YTest = YTest

# custom type to hold all scalers
class Scalers:

    def __init__(self, scalerX, scalerY):
        self.x = scalerX
        self.y = scalerY

# custom type to hold all data needed for the model
class ModelData(object):

    def __init__(self, Dates, modelData, scalers, predictionData):
        self.Dates = Dates
        self.modelData = modelData
        self.scalers = scalers
        self.predictionData = predictionData
