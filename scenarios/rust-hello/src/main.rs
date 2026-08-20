use std::env;

fn main() {
    // Get the first CLI argument (skip program name). If missing, default to empty string.
    let name = env::args().nth(1).unwrap_or_default();
    let greeting = rust_hello::greet(&name);
    println!("{}", greeting);
    // Exiting with 0 is default.
}
