pub fn greet(name: &str) -> String {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        String::from("Hello, stranger!")
    } else {
        format!("Hello, {}!", trimmed)
    }
}
