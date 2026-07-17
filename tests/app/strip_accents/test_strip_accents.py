"""Comprehensive tests for the strip_accents function."""

import pytest
from src.app.strip_accents import strip_accents


class TestStripAccentsBasic:
    """Test basic strip_accents functionality."""

    def test_no_accents(self):
        """Test that text without accents is unchanged."""
        assert strip_accents("hello") == "hello"

    def test_single_accented_character_e(self):
        """Test single accented e character."""
        assert strip_accents("café") == "cafe"

    def test_single_accented_character_n(self):
        """Test single accented n character."""
        assert strip_accents("mañana") == "manana"

    def test_single_accented_character_u(self):
        """Test single accented u character."""
        assert strip_accents("Zürich") == "Zurich"

    def test_single_word_with_accent(self):
        """Test a single word with accent."""
        assert strip_accents("naïve") == "naive"


class TestStripAccentsCommonAccents:
    """Test common accented characters from various languages."""

    def test_acute_accent_e(self):
        """Test acute accent on e (é)."""
        assert strip_accents("résumé") == "resume"

    def test_acute_accent_a(self):
        """Test acute accent on a (á)."""
        assert strip_accents("á") == "a"

    def test_acute_accent_i(self):
        """Test acute accent on i (í)."""
        assert strip_accents("sí") == "si"

    def test_acute_accent_o(self):
        """Test acute accent on o (ó)."""
        assert strip_accents("pólo") == "polo"

    def test_grave_accent_e(self):
        """Test grave accent on e (è)."""
        assert strip_accents("crème") == "creme"

    def test_grave_accent_a(self):
        """Test grave accent on a (à)."""
        assert strip_accents("à") == "a"

    def test_grave_accent_u(self):
        """Test grave accent on u (ù)."""
        assert strip_accents("où") == "ou"

    def test_circumflex_accent_e(self):
        """Test circumflex accent on e (ê)."""
        assert strip_accents("tête") == "tete"

    def test_circumflex_accent_a(self):
        """Test circumflex accent on a (â)."""
        assert strip_accents("âge") == "age"

    def test_circumflex_accent_o(self):
        """Test circumflex accent on o (ô)."""
        assert strip_accents("côté") == "cote"

    def test_diaeresis_u(self):
        """Test diaeresis (umlaut) on u (ü)."""
        assert strip_accents("ü") == "u"

    def test_diaeresis_o(self):
        """Test diaeresis (umlaut) on o (ö)."""
        assert strip_accents("österreich") == "osterreich"

    def test_diaeresis_a(self):
        """Test diaeresis (umlaut) on a (ä)."""
        assert strip_accents("äpfel") == "apfel"

    def test_diaeresis_e(self):
        """Test diaeresis (umlaut) on e (ë)."""
        assert strip_accents("noël") == "noel"

    def test_cedilla_c(self):
        """Test cedilla on c (ç)."""
        assert strip_accents("français") == "francais"

    def test_cedilla_single(self):
        """Test single cedilla character."""
        assert strip_accents("ç") == "c"

    def test_tilde_n(self):
        """Test tilde on n (ñ)."""
        assert strip_accents("español") == "espanol"

    def test_tilde_n_single(self):
        """Test single tilde n character."""
        assert strip_accents("ñ") == "n"

    def test_tilde_o(self):
        """Test tilde on o (õ)."""
        assert strip_accents("não") == "nao"

    def test_tilde_a(self):
        """Test tilde on a (ã)."""
        assert strip_accents("são") == "sao"


class TestStripAccentsCombinedAccents:
    """Test characters with multiple or combined accents."""

    def test_double_accented_characters(self):
        """Test multiple accented characters in one word."""
        assert strip_accents("café résumé") == "cafe resume"

    def test_all_vowels_with_accents(self):
        """Test all vowels with accents."""
        assert strip_accents("àáâãäèéêëìíîïòóôõöùúûü") == "aaaaaeeeeiiiiooooouuuu"

    def test_mixed_accents_in_phrase(self):
        """Test phrase with various accent types."""
        assert strip_accents("école élève étudiant") == "ecole eleve etudiant"

    def test_repeated_accented_characters(self):
        """Test repeated accented characters."""
        assert strip_accents("éééé") == "eeee"


class TestStripAccentsNonAccentedCharacters:
    """Test that non-accented characters pass through unchanged."""

    def test_numbers(self):
        """Test that numbers are preserved."""
        assert strip_accents("123456") == "123456"

    def test_special_characters(self):
        """Test that special characters are preserved."""
        assert strip_accents("!@#$%^&*()") == "!@#$%^&*()"

    def test_punctuation(self):
        """Test that punctuation is preserved."""
        assert strip_accents(".,;:?!") == ".,;:?!"

    def test_uppercase_letters(self):
        """Test that uppercase letters without accents are preserved."""
        assert strip_accents("HELLO") == "HELLO"

    def test_lowercase_letters(self):
        """Test that lowercase letters without accents are preserved."""
        assert strip_accents("world") == "world"

    def test_mixed_case_no_accents(self):
        """Test mixed case without accents."""
        assert strip_accents("HeLLo WoRLd") == "HeLLo WoRLd"

    def test_hyphens_and_underscores(self):
        """Test that hyphens and underscores are preserved."""
        assert strip_accents("hello-world_test") == "hello-world_test"

    def test_spaces(self):
        """Test that spaces are preserved."""
        assert strip_accents("hello world") == "hello world"

    def test_tabs_and_newlines(self):
        """Test that tabs and newlines are preserved."""
        assert strip_accents("hello\tworld\ntest") == "hello\tworld\ntest"


class TestStripAccentsEmptyString:
    """Test empty string handling."""

    def test_empty_string(self):
        """Test that empty string returns empty string."""
        assert strip_accents("") == ""

    def test_whitespace_only(self):
        """Test that whitespace-only string returns as-is."""
        assert strip_accents("   ") == "   "

    def test_tabs_only(self):
        """Test that tabs-only string returns as-is."""
        assert strip_accents("\t\t\t") == "\t\t\t"

    def test_newlines_only(self):
        """Test that newlines-only string returns as-is."""
        assert strip_accents("\n\n\n") == "\n\n\n"


class TestStripAccentsMixedText:
    """Test mixed accented and non-accented text."""

    def test_accented_with_numbers(self):
        """Test accented text mixed with numbers."""
        assert strip_accents("café123") == "cafe123"

    def test_accented_with_special_chars(self):
        """Test accented text mixed with special characters."""
        assert strip_accents("café@example.com") == "cafe@example.com"

    def test_accented_with_punctuation(self):
        """Test accented text with punctuation."""
        assert strip_accents("résumé, c.v.") == "resume, c.v."

    def test_accented_in_sentence(self):
        """Test accented characters in a full sentence."""
        assert strip_accents("Bonjour, c'est une très bonne journée!") == "Bonjour, c'est une tres bonne journee!"

    def test_mixed_languages(self):
        """Test text from multiple languages."""
        assert strip_accents("café naïve español") == "cafe naive espanol"

    def test_accented_with_hyphens(self):
        """Test accented text with hyphens."""
        assert strip_accents("bien-être") == "bien-etre"

    def test_accented_with_apostrophe(self):
        """Test accented text with apostrophes."""
        assert strip_accents("c'est l'école") == "c'est l'ecole"


class TestStripAccentsRealWorldExamples:
    """Test real-world use cases."""

    def test_french_name(self):
        """Test French name with accents."""
        assert strip_accents("François") == "Francois"

    def test_spanish_name(self):
        """Test Spanish name with accents."""
        assert strip_accents("José") == "Jose"

    def test_portuguese_name(self):
        """Test Portuguese name with accents."""
        assert strip_accents("João") == "Joao"

    def test_german_city_name(self):
        """Test German city name with umlaut."""
        assert strip_accents("München") == "Munchen"

    def test_french_word(self):
        """Test French word from a sentence."""
        assert strip_accents("L'élève était très attentif.") == "L'eleve etait tres attentif."

    def test_spanish_word(self):
        """Test Spanish word from a sentence."""
        assert strip_accents("¿Cómo estás?") == "Como estas?"

    def test_email_with_accents(self):
        """Test email address with accented domain."""
        assert strip_accents("contact@café.fr") == "contact@cafe.fr"

    def test_url_like_text(self):
        """Test URL-like text with accents."""
        assert strip_accents("www.résumé-exemple.com") == "www.resume-exemple.com"

    def test_product_name(self):
        """Test product name with accents."""
        assert strip_accents("Crème Brûlée") == "Creme Brulee"

    def test_menu_item(self):
        """Test menu item with accents."""
        assert strip_accents("Soufflé à la vanille") == "Souffle a la vanille"


class TestStripAccentsEdgeCases:
    """Test edge cases and unusual inputs."""

    def test_only_accents_no_base(self):
        """Test combining marks without base characters (edge case)."""
        # This tests behavior with combining diacriticals
        assert strip_accents("é") == "e"

    def test_very_long_text(self):
        """Test with very long text."""
        long_text = "café " * 100
        expected = "cafe " * 100
        assert strip_accents(long_text) == expected

    def test_single_character_uppercase_with_accent(self):
        """Test single uppercase letter with accent."""
        assert strip_accents("É") == "E"

    def test_single_character_lowercase_with_accent(self):
        """Test single lowercase letter with accent."""
        assert strip_accents("é") == "e"

    def test_accents_at_beginning(self):
        """Test accented character at the beginning."""
        assert strip_accents("école") == "ecole"

    def test_accents_at_end(self):
        """Test accented character at the end."""
        assert strip_accents("café") == "cafe"

    def test_accents_in_middle(self):
        """Test accented character in the middle."""
        assert strip_accents("naïve") == "naive"

    def test_consecutive_accents(self):
        """Test consecutive accented characters."""
        assert strip_accents("ää") == "aa"

    def test_all_accent_types_mixed(self):
        """Test all different accent types in one string."""
        assert strip_accents("àáâãäèéêëìíîïòóôõöùúûüç") == "aaaaaeeeeiiiiooooouuuuc"


class TestStripAccentsCasePreservation:
    """Test that case is preserved when removing accents."""

    def test_uppercase_accented_preserved(self):
        """Test that uppercase accented characters become uppercase base chars."""
        assert strip_accents("CAFÉ") == "CAFE"

    def test_lowercase_accented_preserved(self):
        """Test that lowercase accented characters become lowercase base chars."""
        assert strip_accents("café") == "cafe"

    def test_mixed_case_preserved(self):
        """Test that mixed case is preserved."""
        assert strip_accents("CafÉ") == "CafE"

    def test_proper_noun_case_preserved(self):
        """Test that proper noun case is preserved."""
        assert strip_accents("François Marie") == "Francois Marie"

    def test_acronym_case_preserved(self):
        """Test that acronym case is preserved."""
        assert strip_accents("CAFÉ") == "CAFE"


class TestStripAccentsConsistency:
    """Test consistency and idempotence."""

    def test_idempotent_single_call(self):
        """Test that result of single call is idempotent."""
        text = "café"
        result = strip_accents(text)
        assert strip_accents(result) == result

    def test_idempotent_multiple_calls(self):
        """Test that applying strip_accents twice gives same result as once."""
        text = "résumé français"
        once = strip_accents(text)
        twice = strip_accents(once)
        assert once == twice

    def test_consistency_with_examples(self):
        """Test consistency with documented examples."""
        assert strip_accents("café") == "cafe"
        assert strip_accents("naïve") == "naive"
        assert strip_accents("résumé") == "resume"
        assert strip_accents("Zürich") == "Zurich"
        assert strip_accents("hello") == "hello"
        assert strip_accents("") == ""

    def test_consistency_mixed_example(self):
        """Test consistency with mixed example."""
        assert strip_accents("café résumé") == "cafe resume"

    def test_consistency_with_accents_and_special(self):
        """Test consistency with accents and special characters."""
        assert strip_accents("éclair à la crème") == "eclair a la creme"
