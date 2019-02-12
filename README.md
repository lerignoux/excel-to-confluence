# excel-to-confluence
A simple web page to export Excel sheets to confluence

## Usage
- **Drag and drop** your excel file in the drop area
- Select the **sheet** you wish to export  
A preview showing the expected result will be displayed
- **input** your **Page Id** and **Page title** and press **Upload** to upload the table to confluence.

#### Manual upload
In case you cannot or don't wish to upload directly you can go to the **Manual Upload tab** and copy the source code.  
This content can be pasted directly in your confluence page (in edit mode using the top right source code button)  ![see Source edit button](https://github.com/lerignoux/excel-to-confluence/blob/master/ConfluenceSourceEditButton.png)

#### Conditional formatting
The conditional formatting support is very limited.
- With conditional formatting parsing can take a very long time for big Excel files (50s for 50Mb file)
- currently only **Cell value equals** or **Cell value between** are supported.  
Fee free to [open an issue](https://github.com/lerignoux/excel-to-confluence/issues) or submit a merge request for additional support
- Multiple conditional formatting rules applied on the same exact cell range are **not supported** (due to [openpyxl](https://openpyxl.readthedocs.io) base library support)


## Development
copy and fill both `app/config.json` and `nginx/nginx.conf` from their respective templates
```
docker-compose up
```

#### Usage
After starting the container:  
* just go to the web page (*<server_name>:5443*,  port 5443 if ssl if https not configured)  
* Follow above user documentation

#### Dev
if you wish to spawn the app container standalone:
```
docker run --rm --name excel-to-confluence -v ./app:/app -p 5000:5000 excel-to-confluence
```

#### Contributions
Contribution are more than welcome using regular merge requests process.
Please follow PEP8 standard as much as possible
