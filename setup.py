from setuptools import setup, find_packages

setup(
    name="pymfl",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'requests',
        'flask',
        'flask-cors'
    ],
) 