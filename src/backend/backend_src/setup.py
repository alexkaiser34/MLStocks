from setuptools import setup, find_packages

VERSION = '0.0.1' 
DESCRIPTION = 'Stock App Backend'
LONG_DESCRIPTION = 'This python module makes requests to the finnhub api. It then stores that data in an influx database'
REQUIREMENTS = [i.strip() for i in open("requirements.txt").readlines()]

# Setting up
setup(
        name="src", 
        version=VERSION,
        author="Alex Kaiser",
        author_email="alexkaiser@me.com",
        description=DESCRIPTION,
        long_description=LONG_DESCRIPTION,
        packages=find_packages('src'),
        package_dir={"": "src"},
        install_requires=REQUIREMENTS,
        keywords=['python', 'first package'],
        classifiers= [
            "Development Status :: 3 - Alpha",
            "Intended Audience :: Education",
            "Programming Language :: Python :: 2",
            "Programming Language :: Python :: 3",
            "Operating System :: MacOS :: MacOS X",
            "Operating System :: Microsoft :: Windows",
        ]
)