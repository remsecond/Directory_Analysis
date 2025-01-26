import pandas as pd
from twisted.internet import reactor, defer
from klein import Klein
import time

def test_pandas():
    print("\nTesting pandas:")
    df = pd.DataFrame({'A': [1, 2, 3], 'B': ['a', 'b', 'c']})
    print(df)

def test_klein():
    print("\nTesting klein:")
    app = Klein()
    print(f"Successfully created Klein app: {app}")

@defer.inlineCallbacks
def test_twisted():
    print("\nTesting twisted:")
    print("Twisted reactor is working")
    yield defer.succeed(None)
    reactor.stop()

if __name__ == "__main__":
    print("Testing installed packages...")
    
    test_pandas()
    test_klein()
    
    reactor.callLater(0, test_twisted)
    reactor.run()
