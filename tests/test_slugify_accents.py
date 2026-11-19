# AC#2: slugify("Crème Brûlée à la Carte") == "creme-brulee-a-la-carte"
# slugify must NFKD-normalize and strip combining marks so accented
# characters are folded to their ASCII base forms.

from app.slugify import slugify


def test_slugify_creme_brulee_folds_accents_to_ascii():
    assert slugify("Crème Brûlée à la Carte") == "creme-brulee-a-la-carte"
