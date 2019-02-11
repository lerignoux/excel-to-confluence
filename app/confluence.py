import logging
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

    def source_from_data(self, data, header=None, template="default.html"):
        if header is None:
            header = ""
        with open(f"confluence_templates/{template}") as f:
            res = f.read()
        return res.format(header=header, table=self.table_source_from_data(data))

    def html_style(self, cell):
        data = cell.get('style', {})
        res = ""
        for name, value in data.items():
            if value is not None:
                res += f" {name}: {value};"
        return res

    def html_value(self, cell):
        value = cell.get('value')
        return value if value is not None else ""

    def table_source_from_data(self, data, template="default_table.html"):
        with open(f"confluence_templates/{template}") as f:
            tpl = f.read()
        tables = []
        for name, data in data.items():
            rows = []
            for row_data in data:
                rows.append("\n".join(
                    (self.cell_tpl.format(style=self.html_style(cell), value=self.html_value(cell)) for cell in row_data)
                ))
            tables.append(deepcopy(tpl).format(content="\n".join(
                self.row_tpl.format(style="", value=row) for row in rows
            )))
        return "\n".join(table for table in tables)
