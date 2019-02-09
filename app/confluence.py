import logging
import aiohttp
from copy import deepcopy

log = logging.getLogger(__name__)


class Confluence():

    cell_tpl = "<td style=\"{style}\">{value}</td>"
    row_tpl = "<tr style=\"{style}\">{value}</tr>"

    def __init__(self, config):
        self.config = config

    @property
    def host(self):
        return self.config("confluence", {}).get('host')

    def source_from_data(self, data, , header="", template="default.html"):
        with open(f"confluence_templates/{template}") as f:
            res = f.read()
        tables_source =
        res.format(header=header, table=self.table_from_data(data))

    def table_source_from_data(self, data, template="default_table.html"):
        with open(f"confluence_templates/{template}") as f:
            tpl = f.read()
        tables = []
        for name, data in data.items():
            rows = []
            for row_data in data:
                rows.append("\n".join(
                    (cell_tpl.format(style=cell.get(style, ""), value=cell.get(value, "")) for cell in row_data)
                ))
            tables.append(deepcopy(tpl).format(content="\n".join(
                row_tpl.format(style="", value=row) for row in rows
            )))
        return "\n".join(table for table in tables)
