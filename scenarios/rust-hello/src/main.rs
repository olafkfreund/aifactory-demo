use rust_hello::greet;
use std::env;

fn main() {
    let name = env::args().nth(1).unwrap_or_default();
    println!("{}", greet(&name));
}
