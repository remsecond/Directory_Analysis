import tkinter as tk
from tkinter import filedialog
import json
import sys

def select_folder():
    # Hide the main window
    root = tk.Tk()
    root.withdraw()

    # Open native Windows folder picker dialog
    folder_path = filedialog.askdirectory(title="Select Folder")
    
    if folder_path:
        # Save the selected path to config file
        config = {"selected_folder": folder_path}
        with open("config.json", "w") as f:
            json.dump(config, f, indent=2)
        print(folder_path)
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    select_folder()
