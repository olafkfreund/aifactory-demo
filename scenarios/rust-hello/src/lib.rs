pub fn greet(name: &str) -> String {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        String::from("Hello, stranger!")
    } else {
        format!("Hello, {}!", trimmed)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet_world() {
        assert_eq!(greet("World"), "Hello, World!");
    }

    #[test]
    fn test_greet_empty_name() {
        assert_eq!(greet(""), "Hello, stranger!");
    }

    #[test]
    fn test_greet_whitespace_trimmed() {
        assert_eq!(greet("  Bob "), "Hello, Bob!");
    }
}
