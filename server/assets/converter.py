import sys

def add_escape_chars(original_string):
    return original_string.replace('"', '\\"').replace("'", "\\'").replace("\\", "\\\\")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <string input>")
        sys.exit(1)
    
    input_string = sys.argv[1]
    escaped_string = add_escape_chars(input_string)
    
    with open('output.py', 'w') as f:
        f.write(f'defaultPfp = "{escaped_string}"\n')
    
    print("Output written to output.py")
