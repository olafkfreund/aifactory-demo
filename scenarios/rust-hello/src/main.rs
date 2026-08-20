fn main() {
    let args: Vec<String> = std::env::args().collect();
    let name = if args.len() > 1 { &args[1] } else { "" };
    println!("{}", rust_hello::greet(name));
}
