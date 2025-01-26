# Next Session Plan

## Goal
Create a simple file organizer that moves files from input to output folders based on their type.

## Steps

1. Create Basic Structure
   ```
   input/        # Where user puts files
   output/       # Where files get sorted
     documents/  # For .doc, .pdf, etc
     images/     # For .jpg, .png, etc
     etc/        # For other files
   ```

2. Create Simple Python Script (organize.py)
   ```python
   import os
   import shutil

   def organize_files():
       # Get files from input
       # Check their extensions
       # Move to appropriate output folder
       pass
   ```

3. Create Simple Batch File (organize.bat)
   ```batch
   @echo off
   python organize.py
   pause
   ```

4. Test Process
   - Put sample files in input
   - Run organize.bat
   - Verify files moved correctly

No servers, no complex architecture, no extensive documentation. Just files moving from input to output folders.
