/// Returns a greeting for the given name.
///
/// * Trims surrounding whitespace from `name`.
/// * If the trimmed name is empty, returns "Hello, stranger!".
/// * Otherwise returns "Hello, {name}!" preserving any internal whitespace.
pub fn greet(name: &str) -> String {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        "Hello, stranger!".to_string()
    } else {
        format!("Hello, {}!", trimmed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greets_a_name() {
        assert_eq!(greet("World"), "Hello, World!");
    }

    #[test]
    fn greets_stranger_on_empty_name() {
        assert_eq!(greet(""), "Hello, stranger!");
    }

    #[test]
    fn trims_surrounding_whitespace() {
        assert_eq!(greet("  Bob "), "Hello, Bob!");
    }
}
