const END_OF_INPUT = -1;

const base64Chars: string[] = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3',
    '4', '5', '6', '7', '8', '9', '+', '/'
];

const reverseBase64Chars: { [key: string]: number } = {};
base64Chars.forEach((char, i) => {
    reverseBase64Chars[char] = i;
});

let base64Str: string | null = null;
let base64Count: number = 0;

function setBase64Str(str: string): void {
    base64Str = str;
    base64Count = 0;
}

function readBase64(): number {
    if (!base64Str) return END_OF_INPUT;
    if (base64Count >= base64Str.length) return END_OF_INPUT;
    const c = base64Str.charCodeAt(base64Count) & 0xff;
    base64Count++;
    return c;
}

function encodeBase64(str: string): string {
    setBase64Str(str);
    let result = '';
    const inBuffer: number[] = [0, 0, 0];
    let lineCount = 0;
    let done = false;

    while (!done && (inBuffer[0] = readBase64()) !== END_OF_INPUT) {
        inBuffer[1] = readBase64();
        inBuffer[2] = readBase64();
        result += base64Chars[inBuffer[0] >> 2];
        if (inBuffer[1] !== END_OF_INPUT) {
            result += base64Chars[((inBuffer[0] << 4) & 0x30) | (inBuffer[1] >> 4)];
            if (inBuffer[2] !== END_OF_INPUT) {
                result += base64Chars[((inBuffer[1] << 2) & 0x3c) | (inBuffer[2] >> 6)];
                result += base64Chars[inBuffer[2] & 0x3f];
            } else {
                result += base64Chars[((inBuffer[1] << 2) & 0x3c)];
                result += '=';
                done = true;
            }
        } else {
            result += base64Chars[((inBuffer[0] << 4) & 0x30)];
            result += '==';
            done = true;
        }
        lineCount += 4;
        if (lineCount >= 76) {
            result += '\n';
            lineCount = 0;
        }
    }
    return result;
}

function readReverseBase64(): number {
    if (!base64Str) return END_OF_INPUT;
    while (true) {
        if (base64Count >= base64Str.length) return END_OF_INPUT;
        const nextCharacter = base64Str.charAt(base64Count);
        base64Count++;
        if (reverseBase64Chars[nextCharacter]) {
            return reverseBase64Chars[nextCharacter];
        }
        if (nextCharacter === 'A') return 0;
    }
    return END_OF_INPUT;
}

function ntos(n: number): string {
    let hexStr = n.toString(16);
    if (hexStr.length === 1) hexStr = '0' + hexStr;
    hexStr = '%' + hexStr;
    return unescape(hexStr);
}

function decodeBase64(str: string): string {
    setBase64Str(str);
    let result = '';
    const inBuffer: number[] = [0, 0, 0, 0];
    let done = false;

    while (!done && (inBuffer[0] = readReverseBase64()) !== END_OF_INPUT
        && (inBuffer[1] = readReverseBase64()) !== END_OF_INPUT) {
        inBuffer[2] = readReverseBase64();
        inBuffer[3] = readReverseBase64();
        result += ntos(((inBuffer[0] << 2) & 0xff) | (inBuffer[1] >> 4));
        if (inBuffer[2] !== END_OF_INPUT) {
            result += ntos(((inBuffer[1] << 4) & 0xff) | (inBuffer[2] >> 2));
            if (inBuffer[3] !== END_OF_INPUT) {
                result += ntos(((inBuffer[2] << 6) & 0xff) | inBuffer[3]);
            } else {
                done = true;
            }
        } else {
            done = true;
        }
    }
    return result;
}

function decode(encodedStr: string): string {
    let s = encodedStr;

    // strip {xor} if existent
    if (s.toUpperCase().substring(0, 5) === "{XOR}") {
        s = s.substr(5);
    }

    s = decodeBase64(s);

    // XOR each char to ASCII('_') (underscore is 95)
    let r = '';
    for (let i = 0; i < s.length; i++) {
        r += String.fromCharCode(s.charCodeAt(i) ^ 95);
    }

    return r;
}

function encode(decodedStr: string): string {
    let s = decodedStr;

    // XOR each char to ASCII('_') (underscore is 95)
    let r = '';
    for (let i = 0; i < s.length; i++) {
        r += String.fromCharCode(s.charCodeAt(i) ^ 95);
    }

    r = encodeBase64(r);

    // add {xor}
    return "{xor}" + r;
}
