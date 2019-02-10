# excel-to-confluence
A simple web page to export Excel sheets to confluence

## tldr
copy and fill both `app/config.json` and `nginx/nginx.conf` from their respective templates
```
docker-compose up
```

## Usage
After starting the container, just go to the web page (localhost:1080) and drop down your excel file.

Once imported you can copy the html code using the top right clipboard icon.
In confluence edit the page, use the code mode and paste your new page code.

## Dev
if you wish to spawn the app container standalone:
```
docker run --rm --name excel-to-confluence -v ./app:/app -p 5000:5000 excel-to-confluence
```
