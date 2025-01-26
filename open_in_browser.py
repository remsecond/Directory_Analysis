import webbrowser
import os

# Get absolute path to HTML file
html_path = os.path.abspath('test.html')
url = f'file:///{html_path}'

# Open in default browser
webbrowser.open(url)
