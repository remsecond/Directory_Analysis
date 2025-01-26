using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class ProcessingProgress
{
    public required string Path { get; set; }
    public required string LastStatus { get; set; }
    public required List<string> NewFiles { get; set; } = new();
    public required List<string> ModifiedFiles { get; set; } = new();
    public required List<string> DeletedFiles { get; set; } = new();
    public required string Message { get; set; }
    public required string Status { get; set; }
}

public class BatchServerClient
{
    private readonly string baseUrl;

    public BatchServerClient(string baseUrl)
    {
        this.baseUrl = baseUrl;
    }

    public async IAsyncEnumerable<ProcessingProgress> ProcessFolderAsync(
        string folderPath,
        bool recursive = true,
        string[]? selectedFiles = null)
    {
        // Simulate processing
        yield return new ProcessingProgress
        {
            Path = folderPath,
            LastStatus = "Processing",
            NewFiles = new List<string>(),
            ModifiedFiles = new List<string>(),
            DeletedFiles = new List<string>(),
            Message = "Processing files...",
            Status = "InProgress"
        };

        await Task.Delay(1000); // Simulate work

        yield return new ProcessingProgress
        {
            Path = folderPath,
            LastStatus = "Complete",
            NewFiles = new List<string> { "file1.txt", "file2.txt" },
            ModifiedFiles = new List<string>(),
            DeletedFiles = new List<string>(),
            Message = "Processing complete",
            Status = "Complete"
        };
    }
}
