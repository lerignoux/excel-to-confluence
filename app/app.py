import argparse
import json
import logging
from io import BytesIO
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


@app.route("/excel", methods=['POST'])
def excel():
    """
    Post an excel file and fetch it's configuration
    """
    sheet = None
    header_row = None
    excel_file = request.files['file']
    sheet = request.values.get('sheet')
    try:
        header_row = int(request.values.get('header_row'))
    except TypeError:
        header_row = None
    excel = Excel(get_config(), excel_file._file)
    confluence = Confluence(get_config())
    content = excel.parse(sheet=sheet, header_row=header_row)
    content['header'] = request.values.get('header')
    content['source'] = confluence.source_from_data(content.get('data', {}), header=content.get('header'))
    return json.dumps(content)


if __name__ == "__main__":
    args = parser.parse_args()
    app.run(host='0.0.0.0')
