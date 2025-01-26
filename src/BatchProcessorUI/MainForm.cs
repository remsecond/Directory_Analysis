using System;
using System.Collections.Generic;
using System.Windows.Forms;

public class MainForm : Form
{
    private readonly BatchServerClient client;
    private readonly List<string> recentFolders = new();
    private string currentPath = string.Empty;

    public MainForm()
    {
        client = new BatchServerClient("http://localhost:5000");
        InitializeComponent();
    }

    private void InitializeComponent()
    {
        // Form initialization code
        Text = "Batch Processor";
        Size = new System.Drawing.Size(800, 600);
    }

    private async void ProcessFolder(string folderPath, bool recursive = true, string[]? selectedFiles = null)
    {
        try
        {
            await foreach (var progress in client.ProcessFolderAsync(folderPath, recursive, selectedFiles))
            {
                // Update UI with progress
                if (progress.NewFiles.Count > 0)
                {
                    // Handle new files
                }

                if (progress.ModifiedFiles.Count > 0)
                {
                    // Handle modified files
                }

                if (progress.DeletedFiles.Count > 0)
                {
                    // Handle deleted files
                }
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error processing folder: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
