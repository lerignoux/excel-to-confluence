# excel-to-confluence
A simple web page to export Excel sheets to confluence

## tldr
```
docker build . -t excel-to-confluence
docker run --name excel-to-confluence --restart=always -p 1080:80 -v ~/excel-to-confluence/:/app -d excel-to-confluence
```

## Usage
After starting the container, just go to the web page (localhost:1080) and drop down your excel file.

Once imported you can copy the html code using the top right clipboard icon.
In confluence edit the page, use the code mode and paste your new page code.
