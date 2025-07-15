# Windows Clipboard Image Reader for PasteMark
# This script reads image data from Windows clipboard and saves it to a temporary file

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

try {
    # Check if clipboard contains image
    $clipboard = [System.Windows.Forms.Clipboard]::GetDataObject()
    
    if ($null -eq $clipboard) {
        Write-Output "error:no clipboard data"
        Exit 1
    }
    
    # Check for image in various formats
    $hasImage = $false
    $image = $null
    
    # Try to get image directly
    if ($clipboard.ContainsImage()) {
        $image = [System.Windows.Forms.Clipboard]::GetImage()
        $hasImage = $true
    }
    # Try PNG format
    elseif ($clipboard.GetDataPresent("PNG")) {
        $stream = $clipboard.GetData("PNG")
        if ($null -ne $stream) {
            $image = [System.Drawing.Image]::FromStream($stream)
            $hasImage = $true
        }
    }
    # Try Bitmap format
    elseif ($clipboard.GetDataPresent([System.Windows.Forms.DataFormats]::Bitmap)) {
        $image = $clipboard.GetData([System.Windows.Forms.DataFormats]::Bitmap)
        $hasImage = $true
    }
    # Try DIB (Device Independent Bitmap)
    elseif ($clipboard.GetDataPresent([System.Windows.Forms.DataFormats]::Dib)) {
        $dibData = $clipboard.GetData([System.Windows.Forms.DataFormats]::Dib)
        if ($null -ne $dibData) {
            # DIB needs special handling
            $stream = New-Object System.IO.MemoryStream
            $stream.Write($dibData, 0, $dibData.Length)
            $stream.Position = 0
            try {
                $image = [System.Drawing.Image]::FromStream($stream)
                $hasImage = $true
            } catch {
                # DIB conversion failed
            } finally {
                $stream.Dispose()
            }
        }
    }
    
    if (-not $hasImage -or $null -eq $image) {
        Write-Output "no image"
        Exit 0
    }
    
    # Generate temporary file path
    $tempDir = [System.IO.Path]::GetTempPath()
    $fileName = "pastemark_" + [System.DateTime]::Now.Ticks + ".png"
    $tempFile = [System.IO.Path]::Combine($tempDir, $fileName)
    
    # Save image as PNG
    $image.Save($tempFile, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Output the file path
    Write-Output $tempFile
    
    # Cleanup
    $image.Dispose()
    Exit 0
    
} catch {
    Write-Output "error:$($_.Exception.Message)"
    Exit 1
}