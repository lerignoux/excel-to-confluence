import logging
import re
from openpyxl import load_workbook
from openpyxl.cell.cell import MergedCell
from openpyxl.formatting.formatting import ConditionalFormattingList

from colorsys import rgb_to_hls, hls_to_rgb

RGBMAX = 0xff  # Corresponds to 255
HLSMAX = 240  # MS excel's tint function expects that HLS is base 240. see:


log = logging.getLogger("excel-to-confluence")


class Excel():

    def __init__(self, config, bytes):
        self.config = config
        self.wb = load_workbook(bytes, read_only=False)  # Need write to list conditional formatting rules

    def parse(self, sheet=None, header_row=None):
        if sheet is None:
            sheet = self.wb.get_sheet_names()[0]
        ws = self.wb.get_sheet_by_name(sheet)
        self.trim(ws)
        if header_row is None:
            header_row = self.best_header_row(ws)
        return {
            'sheets': self.get_sheets(),
            'data': self.parse_sheet(ws, header_row),
            'header_row': header_row,
            'sheet': sheet
        }

    def empty(self, list):
        for cell in list:
            if cell is not None and cell.value:
                return True
        return False

    def get_sheets(self):
        return self.wb.get_sheet_names()

    def get_max_row(self, ws):
        row = ws.max_row
        while row > 0 and self.empty(ws, row, 'rows'):
            row -= 1
        return row

    def get_max_col(self, ws):
        col = ws.max_col
        while row > 0 and self.empty(ws, row, 'rows'):
            row -= 1
        return row

    def trim(self, ws):
        log.debug(f"Starting trimming worsheet")
        precision = 20
        # We clean empty columns and lines from the end
        max_row = ws.max_row
        for row in reversed(list(ws.rows)):
            values = (cell for cell in row[:precision])
            if self.empty(values):
                max_row -= 1
            else:
                continue
        ws.delete_rows(max_row, ws.max_row - max_row)

        max_col = ws.max_column
        for col in reversed(list(ws.columns)):
            values = (cell for cell in col[:precision])
            if self.empty(values):
                ws.delete_cols(-1)
            else:
                continue
        ws.delete_cols(max_col, ws.max_column - max_col)

        # We clean empty columns and lines from the start
        empty_rows = 0
        for row in ws.rows:
            values = (cell for cell in row[:precision])
            if self.empty(values):
                empty_rows += 1
            else:
                continue
        if empty_rows:
            log.info("removing first {empty_rows} empty rows")
            ws.delete_rows(1, empty_rows)

        empty_cols = 0
        for col in ws.columns:
            values = (cell for cell in col[:precision])
            log.info(values)
            if self.empty(values):
                empty_cols += 1
            else:
                break
        if empty_cols:
            log.info("removing first {empty_cols} empty columns")
            ws.delete_cols(1, empty_cols)
        log.debug(f"Finished trimming worsheet")

    def best_header_row(self, ws):
        return 1

    def parse_sheet(self, ws, header_row):
        return {
            ws.title: [
                self.get_row(ws, row) for row in list(ws.iter_rows())[header_row-1:]
            ]
        }

    def get_row(self, ws, rows):
        """
        Extract the formatted sheet content
        """
        return [self.cell_json(cell, ws=ws) for cell in rows]

    def cell_json(self, cell, ws):
        return {
            'value': cell.value if not isinstance(cell, MergedCell) else "",
            'style': {
                'color': self.font_color(cell, ws=ws),
                'background-color': self.fill_color(cell, ws=ws),
                'font-size': cell.font.size if cell.font else 12,
                'font-weight': 'bold' if cell.font and cell.font.bold else None,
                'font-style': 'italic' if cell.font and cell.font.italic else None,
                'vertical-align': 'middle',
                'text-align': 'center'
            }
        }

    def match(self, rule, cell):
        if rule.type == 'cellIs':
            if rule.operator == 'equal' and cell.value in rule.formula:
                return True
        return False

    def font_color(self, cell, ws):
        potential = []
        for cond_format in ws.conditional_formatting:
            if cell.coordinate in cond_format:
                log.debug(cond_format.rules)
                potential.append(cond_format)
                for rule in cond_format.rules:
                    if self.match(rule, cell):
                        import rpdb; rpdb.Rpdb().set_trace()
        return self.excel_color(cell.font.color, default="#000") if cell.font else "#000"

    def fill_color(self, cell, ws):
        return self.excel_color(cell.fill.fgColor, default=None) or self.excel_color(cell.fill.bgColor, default="#fff") if cell.fill else "#fff"

    def excel_color(self, color, default="#000"):
        if color is None:
            # Dumb dirty fix to handle the library weird design
            return default
        if color.theme and color.tint:
            return "#%s" % self.theme_and_tint_to_rgb(color.theme, color.tint)
        if False and color is None or str(color.rgb) == "Values must be of type <class 'str'>":
            # Dumb dirty fix to handle the library weird design
            return default
        try:
            res = re.sub("^FF", "#", color.rgb)
            return res
        except TypeError:
            import rpdb; rpdb.Rpdb().set_trace()
            log.error(f"could not interpret {color.rgb} ({color.rgb.__class__})")
            raise
        except AttributeError:
            return default

    def rgb_to_ms_hls(self, red, green=None, blue=None):
        """Converts rgb values in range (0,1) or a hex string of the form '[#aa]rrggbb' to HLSMAX based HLS, (alpha values are ignored)"""
        if green is None:
            if isinstance(red, str):
                if len(red) > 6:
                    red = red[-6:]  # Ignore preceding '#' and alpha values
                blue = int(red[4:], 16) / RGBMAX
                green = int(red[2:4], 16) / RGBMAX
                red = int(red[0:2], 16) / RGBMAX
            else:
                red, green, blue = red
        h, l, s = rgb_to_hls(red, green, blue)
        return (int(round(h * HLSMAX)), int(round(l * HLSMAX)), int(round(s * HLSMAX)))

    def ms_hls_to_rgb(self, hue, lightness=None, saturation=None):
        """Converts HLSMAX based HLS values to rgb values in the range (0,1)"""
        if lightness is None:
            hue, lightness, saturation = hue
        return hls_to_rgb(hue / HLSMAX, lightness / HLSMAX, saturation / HLSMAX)

    def rgb_to_hex(self, red, green=None, blue=None):
        """Converts (0,1) based RGB values to a hex string 'rrggbb'"""
        if green is None:
            red, green, blue = red
        return ('%02x%02x%02x' % (int(round(red * RGBMAX)), int(round(green * RGBMAX)), int(round(blue * RGBMAX)))).upper()

    def get_theme_colors(self):
        """Gets theme colors from the workbook"""
        # see: https://groups.google.com/forum/#!topic/openpyxl-users/I0k3TfqNLrc
        from openpyxl.xml.functions import QName, fromstring
        xlmns = 'http://schemas.openxmlformats.org/drawingml/2006/main'
        root = fromstring(self.wb.loaded_theme)
        themeEl = root.find(QName(xlmns, 'themeElements').text)
        colorSchemes = themeEl.findall(QName(xlmns, 'clrScheme').text)
        firstColorScheme = colorSchemes[0]

        colors = []

        for c in ['lt1', 'dk1', 'lt2', 'dk2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6']:
            accent = firstColorScheme.find(QName(xlmns, c).text)

            if 'window' in accent.getchildren()[0].attrib['val']:
                colors.append(accent.getchildren()[0].attrib['lastClr'])
            else:
                colors.append(accent.getchildren()[0].attrib['val'])

        return colors

    def tint_luminance(self, tint, lum):
        """Tints a HLSMAX based luminance"""
        # See: http://ciintelligence.blogspot.co.uk/2012/02/converting-excel-theme-color-and-tint.html
        if tint < 0:
            return int(round(lum * (1.0 + tint)))
        else:
            return int(round(lum * (1.0 - tint) + (HLSMAX - HLSMAX * (1.0 - tint))))

    def theme_and_tint_to_rgb(self, theme, tint):
        """Given a workbook, a theme number and a tint return a hex based rgb"""
        rgb = self.get_theme_colors()[theme]
        h, l, s = self.rgb_to_ms_hls(rgb)
        return self.rgb_to_hex(self.ms_hls_to_rgb(h, self.tint_luminance(tint, l), s))
