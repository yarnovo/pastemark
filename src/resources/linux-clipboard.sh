#!/bin/bash
# Linux Clipboard Image Reader for PasteMark
# This script reads image data from Linux clipboard and saves it to a temporary file

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get image using xclip (X11)
get_image_xclip() {
    # Check if xclip is available
    if ! command_exists xclip; then
        echo "error:xclip not installed"
        exit 1
    fi
    
    # Check if clipboard contains image
    if xclip -selection clipboard -t TARGETS -o 2>/dev/null | grep -q "image/"; then
        # Create temporary file
        tempfile=$(mktemp --suffix=.png)
        
        # Try to get PNG format first
        if xclip -selection clipboard -t TARGETS -o 2>/dev/null | grep -q "image/png"; then
            xclip -selection clipboard -t image/png -o > "$tempfile" 2>/dev/null
        # Try JPEG format
        elif xclip -selection clipboard -t TARGETS -o 2>/dev/null | grep -q "image/jpeg"; then
            tempfile_jpg=$(mktemp --suffix=.jpg)
            xclip -selection clipboard -t image/jpeg -o > "$tempfile_jpg" 2>/dev/null
            # Convert to PNG using ImageMagick if available
            if command_exists convert; then
                convert "$tempfile_jpg" "$tempfile"
                rm -f "$tempfile_jpg"
            else
                mv "$tempfile_jpg" "$tempfile"
            fi
        # Try any available image format
        else
            format=$(xclip -selection clipboard -t TARGETS -o 2>/dev/null | grep "image/" | head -1)
            if [ -n "$format" ]; then
                xclip -selection clipboard -t "$format" -o > "$tempfile" 2>/dev/null
            fi
        fi
        
        # Check if file was created and has content
        if [ -s "$tempfile" ]; then
            echo "$tempfile"
            exit 0
        else
            rm -f "$tempfile"
            echo "no image"
            exit 0
        fi
    else
        echo "no image"
        exit 0
    fi
}

# Function to get image using wl-paste (Wayland)
get_image_wl_paste() {
    # Check if wl-paste is available
    if ! command_exists wl-paste; then
        echo "error:wl-paste not installed"
        exit 1
    fi
    
    # Check if clipboard contains image
    if wl-paste --list-types 2>/dev/null | grep -q "image/"; then
        # Create temporary file
        tempfile=$(mktemp --suffix=.png)
        
        # Try to get PNG format first
        if wl-paste --list-types 2>/dev/null | grep -q "image/png"; then
            wl-paste --type image/png > "$tempfile" 2>/dev/null
        # Try JPEG format
        elif wl-paste --list-types 2>/dev/null | grep -q "image/jpeg"; then
            tempfile_jpg=$(mktemp --suffix=.jpg)
            wl-paste --type image/jpeg > "$tempfile_jpg" 2>/dev/null
            # Convert to PNG using ImageMagick if available
            if command_exists convert; then
                convert "$tempfile_jpg" "$tempfile"
                rm -f "$tempfile_jpg"
            else
                mv "$tempfile_jpg" "$tempfile"
            fi
        # Try any available image format
        else
            format=$(wl-paste --list-types 2>/dev/null | grep "image/" | head -1)
            if [ -n "$format" ]; then
                wl-paste --type "$format" > "$tempfile" 2>/dev/null
            fi
        fi
        
        # Check if file was created and has content
        if [ -s "$tempfile" ]; then
            echo "$tempfile"
            exit 0
        else
            rm -f "$tempfile"
            echo "no image"
            exit 0
        fi
    else
        echo "no image"
        exit 0
    fi
}

# Main execution
# Check if running on Wayland
if [ "$XDG_SESSION_TYPE" = "wayland" ] || [ -n "$WAYLAND_DISPLAY" ]; then
    get_image_wl_paste
# Default to X11
else
    get_image_xclip
fi