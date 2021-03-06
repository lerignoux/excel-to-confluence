import argparse
import json
import logging
from datetime import datetime
from flask import Flask, render_template, request

from confluence import Confluence
from excel import Excel


log = logging.getLogger("excel-to-confluence")


parser = argparse.ArgumentParser(description='Export an excel file into a confluence page.')
parser.add_argument('--debug', '-d', dest='debug',
                    action='store_true',
                    help='Debug mode')


def get_config():
    with open('config.json', 'r') as f:
        return json.load(f)


app = Flask(__name__)

app.secret_key = get_config()['api']['secret_key']


def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


@app.before_first_request
def initialize():
    log = logging.getLogger("excel-to-confluence")
    level = logging.DEBUG if get_config().get('debug', False) else logging.INFO
    log.setLevel(level)
    ch = logging.StreamHandler()
    ch.setLevel(level)
    formatter = logging.Formatter(
        """%(levelname)s in %(module)s [%(pathname)s:%(lineno)d]:\n%(message)s"""
    )
    ch.setFormatter(formatter)
    log.addHandler(ch)


@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


@app.route('/login_dialog.html', methods=['GET', 'POST'])
def login_dialog():
    return render_template('login_dialog.html')


@app.route("/excel", methods=['POST'])
def excel():
    """
    Post an excel file and fetch it's configuration
    """
    excel_file = request.files['file']
    sheet = request.values.get('sheet')
    conditional_formatting = False if request.values.get('conditional_formatting') == 'false' else True
    excel = Excel(get_config(), excel_file._file, conditional_formatting=conditional_formatting)
    confluence = Confluence(get_config())
    content = excel.parse(sheet=sheet)
    content['header'] = request.values.get('header')
    content['source'] = confluence.source_from_data(content.get('data', {}), header=content.get('header'))
    return json.dumps(content, default=json_serial)


if __name__ == "__main__":
    args = parser.parse_args()
    app.run(host='0.0.0.0')
