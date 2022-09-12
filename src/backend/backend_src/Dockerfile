
# for now, use python slim bullseye package
FROM python:3.8.13-slim-bullseye

# add the user
RUN useradd -ms /bin/sh myuser
USER myuser

# set the working directory to user
WORKDIR /home/myuser

# chown the copy, needed so we do not pip as root
COPY --chown=myuser:myuser . .

# update the env path to include local packages
ENV PATH="${PATH}:/home/myuser/.local/bin"

# # install packages via setup.py
RUN pip install . 

# run the entru script
ENTRYPOINT ["./entry.sh"]


# PROCESS
# docker build -t {tagName} .
# docker save {img} -o out.tar
# docker load -i out.tar

# CONTAINER
# # docker run --name stock-backend -d \
#     --network="host" \
#     --restart unless-stopped \
#     -v $PWD:/home/myuser/env \
#     {img}

