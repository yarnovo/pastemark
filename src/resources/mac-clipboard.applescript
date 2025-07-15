-- macOS Clipboard Image Reader for PasteMark
-- This script reads image data from macOS clipboard and saves it to a temporary file

on run
    try
        -- Try to get PNG data from clipboard
        set imageData to the clipboard as «class PNGf»
        
        -- Generate temporary file path
        set tempDir to (path to temporary items as text)
        set fileName to "pastemark_" & (do shell script "date +%s%N") & ".png"
        set tempFile to tempDir & fileName
        
        -- Write image data to file
        set fileRef to open for access file tempFile with write permission
        write imageData to fileRef
        close access fileRef
        
        -- Return POSIX path
        return POSIX path of tempFile
        
    on error errorMessage
        -- Try alternative formats if PNG fails
        try
            -- Try TIFF format
            set imageData to the clipboard as «class TIFF»
            
            set tempDir to (path to temporary items as text)
            set fileName to "pastemark_" & (do shell script "date +%s%N") & ".tiff"
            set tempFile to tempDir & fileName
            
            set fileRef to open for access file tempFile with write permission
            write imageData to fileRef
            close access fileRef
            
            -- Convert TIFF to PNG using sips
            set posixPath to POSIX path of tempFile
            set pngPath to text 1 thru -6 of posixPath & ".png"
            do shell script "sips -s format png " & quoted form of posixPath & " --out " & quoted form of pngPath
            
            -- Remove original TIFF
            do shell script "rm " & quoted form of posixPath
            
            return pngPath
            
        on error
            return "no image"
        end try
    end try
end run