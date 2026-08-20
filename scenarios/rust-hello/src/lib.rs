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
    fn greets_world() {
        assert_eq!(greet("World"), "Hello, World!");
    }

    #[test]
    fn greets_stranger_on_empty() {
        assert_eq!(greet(""), "Hello, stranger!");
    }

    #[test]
    fn trims_whitespace() {
        assert_eq!(greet("  Bob "), "Hello, Bob!");
    }
}
