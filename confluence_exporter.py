import setup_logging
import aiohttp

log = logging.getLogger(__name__)


class ConfluenceExport():

    def __init__(self, config):
        self.config = config

    @property
    def host(self):
        return self.config("confluence", {}).get('host')

    async def export_page(self, page_id, page_content):
        """
        Export the content to confluence
        """

    def format_page(self, template, content):
        """
        Create the html data content from the data
        """

    def generate_confluence_page(self, page_config, content):
        page_content = self.format_page(content)
        return await self.export_page(page_config['page_id'], page_content)
