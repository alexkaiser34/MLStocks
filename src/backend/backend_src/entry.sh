#! /bin/sh

# first cd to src, this is where script lays
cd src

# copy env data from installation
cp ../env/* .
cp ../env/.env .

# small delay
sleep 2


# decide if we want to install or track live
if [ "$@ " = "--install " ];
then
    python stock-backend.py --install
else
    while [ 1 ]
    do
        python stock-backend.py --live_data
        echo "python script exited"
        sleep 10
    done
fi