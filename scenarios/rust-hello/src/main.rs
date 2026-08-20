use std::env;

fn main() {
    // Get the first argument after the program name, default to empty string.
    let name = env::args().nth(1).unwrap_or_default();
    // Call the library function. The crate name is the package name with hyphens replaced by underscores.
    let greeting = rust_hello::greet(&name);
    println!("{}", greeting);
}
