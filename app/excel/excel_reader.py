import logging
from openpyxl import Workbook

log = logging.getLogger(__name__)


class ExcelReader():

    def __init__(self, config):
        self.config = config

    def extract_file(self, filename):
        with open(filename, 'r') as f:
            return self.extract(f.read())

    def extract(self, wb, sheet=None, start_row=0, col=None, header_row=None):
        """
        """
        # grab the active worksheet
        if sheet is None:
            ws = wb.active
        else:
            ws = wb.sheets[sheet]

        return {}
