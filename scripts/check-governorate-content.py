"""Compare rendered governorate articles, excluding shared site navigation/footer.
The similarity number is an editorial check, not a Google score or ranking prediction.
"""
import itertools
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

class Article(HTMLParser):
    def __init__(self):
        super().__init__()
        self.active = False
        self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag == 'article':
            self.active = True
    def handle_endtag(self, tag):
        if tag == 'article':
            self.active = False
    def handle_data(self, data):
        if self.active:
            self.parts.append(data)

articles = {}
for path in Path('dist/المحافظات').glob('*/index.html'):
    parser = Article()
    source = path.read_text(encoding='utf-8')
    parser.feed(source)
    assert 'شفاط' not in ' '.join(parser.parts), f'Hood promotion in governorate article: {path}'
    words = re.findall(r'[\w]+', ' '.join(parser.parts))
    shingles = {tuple(words[i:i+5]) for i in range(len(words)-4)}
    articles[path.parent.name] = (words, shingles)
    assert '01029834485' in re.search(r'<h1\b[^>]*>(.*?)</h1>', source, re.S).group(1)
assert len(articles) == 27, f'Expected 27 pages, found {len(articles)}'
comparisons = []
for (name_a, (_, a)), (name_b, (_, b)) in itertools.combinations(articles.items(), 2):
    comparisons.append((len(a & b) / len(a | b), name_a, name_b))
maximum = max(comparisons)
minimum = min((len(words), name) for name, (words, _) in articles.items())
assert maximum[0] < .35, f'Large repeated text overlap: {maximum}'
print(f'PASS: compared all {len(comparisons)} page pairs across 27 rendered articles.')
print(f'Largest five-word shingle overlap: {maximum[0]:.1%} ({maximum[1]} / {maximum[2]}).')
print(f'Shortest article: {minimum[0]} words ({minimum[1]}).')
print('This measures exact phrase overlap only; it does not certify SEO quality or policy compliance.')
