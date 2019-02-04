import argparse
import json
import logging
from io import BytesIO
from flask import Flask, render_template, request

from confluence.confluence_exporter import ConfluenceExporter
from excel.excel_reader import ExcelReader


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
    logger = logging.getLogger("excel-to-confluence")
    logger.setLevel(logging.DEBUG)
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    formatter = logging.Formatter(
        """%(levelname)s in %(module)s [%(pathname)s:%(lineno)d]:\n%(message)s"""
    )
    ch.setFormatter(formatter)
    logger.addHandler(ch)


@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


@app.route("/confluence", methods=['POST'])
def confluence():
    """
    request to update a confluence page given some data
    """
    page_id = request.json['page_id']
    data = request.json['data']

    return json.dumps({})


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
    reader = ExcelReader(get_config(), excel_file._file)
    return json.dumps(reader.parse(sheet=sheet, header_row=header_row))


if __name__ == "__main__":
    args = parser.parse_args()
    app.run(host='0.0.0.0')
