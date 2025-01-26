from setuptools import setup, find_packages

setup(
    name="evidenceai",
    version="0.1.0",
    packages=find_packages(include=['evidenceai', 'evidenceai.*']),
    install_requires=[
        "pytest>=6.0.0",
        "pytest-cov>=2.0.0",
    ],
    python_requires=">=3.8",
)
