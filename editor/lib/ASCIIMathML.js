/*
 *  Copyright © 2014 Peter Jipsen and other ASCIIMathML.js contributors
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 */
"use strict"

const asciimath = {};

(function () {
    const AMdelimiter1 = "°", AMescape1 = "\\\\°"

    /*++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

    function createElementXHTML(t) {
        return document.createElementNS("http://www.w3.org/1999/xhtml", t)
    }

    const AMmathml = "http://www.w3.org/1998/Math/MathML"

    function createMmlNode(t, frag) {
        const node = document.createElementNS(AMmathml, t)
        if (frag) node.appendChild(frag)
        return node
    }

//character lists for Mozilla/Netscape fonts
    const AMcal = ["\uD835\uDC9C", "\u212C", "\uD835\uDC9E", "\uD835\uDC9F", "\u2130", "\u2131", "\uD835\uDCA2", "\u210B", "\u2110", "\uD835\uDCA5", "\uD835\uDCA6", "\u2112", "\u2133", "\uD835\uDCA9", "\uD835\uDCAA", "\uD835\uDCAB", "\uD835\uDCAC", "\u211B", "\uD835\uDCAE", "\uD835\uDCAF", "\uD835\uDCB0", "\uD835\uDCB1", "\uD835\uDCB2", "\uD835\uDCB3", "\uD835\uDCB4", "\uD835\uDCB5", "\uD835\uDCB6", "\uD835\uDCB7", "\uD835\uDCB8", "\uD835\uDCB9", "\u212F", "\uD835\uDCBB", "\u210A", "\uD835\uDCBD", "\uD835\uDCBE", "\uD835\uDCBF", "\uD835\uDCC0", "\uD835\uDCC1", "\uD835\uDCC2", "\uD835\uDCC3", "\u2134", "\uD835\uDCC5", "\uD835\uDCC6", "\uD835\uDCC7", "\uD835\uDCC8", "\uD835\uDCC9", "\uD835\uDCCA", "\uD835\uDCCB", "\uD835\uDCCC", "\uD835\uDCCD", "\uD835\uDCCE", "\uD835\uDCCF"]

    const AMfrk = ["\uD835\uDD04", "\uD835\uDD05", "\u212D", "\uD835\uDD07", "\uD835\uDD08", "\uD835\uDD09", "\uD835\uDD0A", "\u210C", "\u2111", "\uD835\uDD0D", "\uD835\uDD0E", "\uD835\uDD0F", "\uD835\uDD10", "\uD835\uDD11", "\uD835\uDD12", "\uD835\uDD13", "\uD835\uDD14", "\u211C", "\uD835\uDD16", "\uD835\uDD17", "\uD835\uDD18", "\uD835\uDD19", "\uD835\uDD1A", "\uD835\uDD1B", "\uD835\uDD1C", "\u2128", "\uD835\uDD1E", "\uD835\uDD1F", "\uD835\uDD20", "\uD835\uDD21", "\uD835\uDD22", "\uD835\uDD23", "\uD835\uDD24", "\uD835\uDD25", "\uD835\uDD26", "\uD835\uDD27", "\uD835\uDD28", "\uD835\uDD29", "\uD835\uDD2A", "\uD835\uDD2B", "\uD835\uDD2C", "\uD835\uDD2D", "\uD835\uDD2E", "\uD835\uDD2F", "\uD835\uDD30", "\uD835\uDD31", "\uD835\uDD32", "\uD835\uDD33", "\uD835\uDD34", "\uD835\uDD35", "\uD835\uDD36", "\uD835\uDD37"]

    const AMbbb = ["\uD835\uDD38", "\uD835\uDD39", "\u2102", "\uD835\uDD3B", "\uD835\uDD3C", "\uD835\uDD3D", "\uD835\uDD3E", "\u210D", "\uD835\uDD40", "\uD835\uDD41", "\uD835\uDD42", "\uD835\uDD43", "\uD835\uDD44", "\u2115", "\uD835\uDD46", "\u2119", "\u211A", "\u211D", "\uD835\uDD4A", "\uD835\uDD4B", "\uD835\uDD4C", "\uD835\uDD4D", "\uD835\uDD4E", "\uD835\uDD4F", "\uD835\uDD50", "\u2124", "\uD835\uDD52", "\uD835\uDD53", "\uD835\uDD54", "\uD835\uDD55", "\uD835\uDD56", "\uD835\uDD57", "\uD835\uDD58", "\uD835\uDD59", "\uD835\uDD5A", "\uD835\uDD5B", "\uD835\uDD5C", "\uD835\uDD5D", "\uD835\uDD5E", "\uD835\uDD5F", "\uD835\uDD60", "\uD835\uDD61", "\uD835\uDD62", "\uD835\uDD63", "\uD835\uDD64", "\uD835\uDD65", "\uD835\uDD66", "\uD835\uDD67", "\uD835\uDD68", "\uD835\uDD69", "\uD835\uDD6A", "\uD835\uDD6B"]

    const CONST = 0, UNARY = 1, BINARY = 2, INFIX = 3, LEFTBRACKET = 4,
        RIGHTBRACKET = 5, SPACE = 6, UNDEROVER = 7, DEFINITION = 8,
        LEFTRIGHT = 9, TEXT = 10, UNARYUNDEROVER = 15 // token types

    const AMquote = {input: "\"", tag: "mtext", output: "mbox", tex: null, ttype: TEXT}

    const AMsymbols = [
//some greek symbols
        {input: "alpha", tag: "mi", output: "\u03B1", tex: null, ttype: CONST},
        {input: "beta", tag: "mi", output: "\u03B2", tex: null, ttype: CONST},
        {input: "chi", tag: "mi", output: "\u03C7", tex: null, ttype: CONST},
        {input: "delta", tag: "mi", output: "\u03B4", tex: null, ttype: CONST},
        {input: "Delta", tag: "mo", output: "\u0394", tex: null, ttype: CONST},
        {input: "epsi", tag: "mi", output: "\u03B5", tex: "epsilon", ttype: CONST},
        {input: "varepsilon", tag: "mi", output: "\u025B", tex: null, ttype: CONST},
        {input: "eta", tag: "mi", output: "\u03B7", tex: null, ttype: CONST},
        {input: "gamma", tag: "mi", output: "\u03B3", tex: null, ttype: CONST},
        {input: "Gamma", tag: "mo", output: "\u0393", tex: null, ttype: CONST},
        {input: "iota", tag: "mi", output: "\u03B9", tex: null, ttype: CONST},
        {input: "kappa", tag: "mi", output: "\u03BA", tex: null, ttype: CONST},
        {input: "lambda", tag: "mi", output: "\u03BB", tex: null, ttype: CONST},
        {input: "Lambda", tag: "mo", output: "\u039B", tex: null, ttype: CONST},
        {input: "lamda", tag: "mi", output: "\u03BB", tex: null, ttype: CONST},
        {input: "Lamda", tag: "mo", output: "\u039B", tex: null, ttype: CONST},
        {input: "mu", tag: "mi", output: "\u03BC", tex: null, ttype: CONST},
        {input: "nu", tag: "mi", output: "\u03BD", tex: null, ttype: CONST},
        {input: "omega", tag: "mi", output: "\u03C9", tex: null, ttype: CONST},
        {input: "Omega", tag: "mo", output: "\u03A9", tex: null, ttype: CONST},
        {input: "phi", tag: "mi", output: "\u03D5", tex: null, ttype: CONST},
        {input: "varphi", tag: "mi", output: "\u03C6", tex: null, ttype: CONST},
        {input: "Phi", tag: "mo", output: "\u03A6", tex: null, ttype: CONST},
        {input: "pi", tag: "mi", output: "\u03C0", tex: null, ttype: CONST},
        {input: "Pi", tag: "mo", output: "\u03A0", tex: null, ttype: CONST},
        {input: "psi", tag: "mi", output: "\u03C8", tex: null, ttype: CONST},
        {input: "Psi", tag: "mi", output: "\u03A8", tex: null, ttype: CONST},
        {input: "rho", tag: "mi", output: "\u03C1", tex: null, ttype: CONST},
        {input: "sigma", tag: "mi", output: "\u03C3", tex: null, ttype: CONST},
        {input: "Sigma", tag: "mo", output: "\u03A3", tex: null, ttype: CONST},
        {input: "tau", tag: "mi", output: "\u03C4", tex: null, ttype: CONST},
        {input: "theta", tag: "mi", output: "\u03B8", tex: null, ttype: CONST},
        {input: "vartheta", tag: "mi", output: "\u03D1", tex: null, ttype: CONST},
        {input: "Theta", tag: "mo", output: "\u0398", tex: null, ttype: CONST},
        {input: "upsilon", tag: "mi", output: "\u03C5", tex: null, ttype: CONST},
        {input: "xi", tag: "mi", output: "\u03BE", tex: null, ttype: CONST},
        {input: "Xi", tag: "mo", output: "\u039E", tex: null, ttype: CONST},
        {input: "zeta", tag: "mi", output: "\u03B6", tex: null, ttype: CONST},

//binary operation symbols
        {input: "*", tag: "mo", output: "\u22C5", tex: "cdot", ttype: CONST},
        {input: "**", tag: "mo", output: "\u2217", tex: "ast", ttype: CONST},
        {input: "***", tag: "mo", output: "\u22C6", tex: "star", ttype: CONST},
        {input: "//", tag: "mo", output: "/", tex: null, ttype: CONST},
        {input: "\\\\", tag: "mo", output: "\\", tex: "backslash", ttype: CONST},
        {input: "setminus", tag: "mo", output: "\\", tex: null, ttype: CONST},
        {input: "xx", tag: "mo", output: "\u00D7", tex: "times", ttype: CONST},
        {input: "|><", tag: "mo", output: "\u22C9", tex: "ltimes", ttype: CONST},
        {input: "><|", tag: "mo", output: "\u22CA", tex: "rtimes", ttype: CONST},
        {input: "|><|", tag: "mo", output: "\u22C8", tex: "bowtie", ttype: CONST},
        {input: "-:", tag: "mo", output: "\u00F7", tex: "div", ttype: CONST},
        {input: "divide", tag: "mo", output: "-:", tex: null, ttype: DEFINITION},
        {input: "@", tag: "mo", output: "\u2218", tex: "circ", ttype: CONST},
        {input: "o+", tag: "mo", output: "\u2295", tex: "oplus", ttype: CONST},
        {input: "ox", tag: "mo", output: "\u2297", tex: "otimes", ttype: CONST},
        {input: "o.", tag: "mo", output: "\u2299", tex: "odot", ttype: CONST},
        {input: "sum", tag: "mo", output: "\u2211", tex: null, ttype: UNDEROVER},
        {input: "prod", tag: "mo", output: "\u220F", tex: null, ttype: UNDEROVER},
        {input: "^^", tag: "mo", output: "\u2227", tex: "wedge", ttype: CONST},
        {input: "^^^", tag: "mo", output: "\u22C0", tex: "bigwedge", ttype: UNDEROVER},
        {input: "vv", tag: "mo", output: "\u2228", tex: "vee", ttype: CONST},
        {input: "vvv", tag: "mo", output: "\u22C1", tex: "bigvee", ttype: UNDEROVER},
        {input: "nn", tag: "mo", output: "\u2229", tex: "cap", ttype: CONST},
        {input: "nnn", tag: "mo", output: "\u22C2", tex: "bigcap", ttype: UNDEROVER},
        {input: "uu", tag: "mo", output: "\u222A", tex: "cup", ttype: CONST},
        {input: "uuu", tag: "mo", output: "\u22C3", tex: "bigcup", ttype: UNDEROVER},

//binary relation symbols
        {input: "!=", tag: "mo", output: "\u2260", tex: "ne", ttype: CONST},
        {input: ":=", tag: "mo", output: ":=", tex: null, ttype: CONST},
        {input: "lt", tag: "mo", output: "<", tex: null, ttype: CONST},
        {input: "<=", tag: "mo", output: "\u2264", tex: "le", ttype: CONST},
        {input: "lt=", tag: "mo", output: "\u2264", tex: "leq", ttype: CONST},
        {input: "gt", tag: "mo", output: ">", tex: null, ttype: CONST},
        {input: ">=", tag: "mo", output: "\u2265", tex: "ge", ttype: CONST},
        {input: "gt=", tag: "mo", output: "\u2265", tex: "geq", ttype: CONST},
        {input: "-<", tag: "mo", output: "\u227A", tex: "prec", ttype: CONST},
        {input: "-lt", tag: "mo", output: "\u227A", tex: null, ttype: CONST},
        {input: ">-", tag: "mo", output: "\u227B", tex: "succ", ttype: CONST},
        {input: "-<=", tag: "mo", output: "\u2AAF", tex: "preceq", ttype: CONST},
        {input: ">-=", tag: "mo", output: "\u2AB0", tex: "succeq", ttype: CONST},
        {input: "in", tag: "mo", output: "\u2208", tex: null, ttype: CONST},
        {input: "!in", tag: "mo", output: "\u2209", tex: "notin", ttype: CONST},
        {input: "sub", tag: "mo", output: "\u2282", tex: "subset", ttype: CONST},
        {input: "sup", tag: "mo", output: "\u2283", tex: "supset", ttype: CONST},
        {input: "sube", tag: "mo", output: "\u2286", tex: "subseteq", ttype: CONST},
        {input: "supe", tag: "mo", output: "\u2287", tex: "supseteq", ttype: CONST},
        {input: "-=", tag: "mo", output: "\u2261", tex: "equiv", ttype: CONST},
        {input: "~=", tag: "mo", output: "\u2245", tex: "cong", ttype: CONST},
        {input: "~~", tag: "mo", output: "\u2248", tex: "approx", ttype: CONST},
        {input: "prop", tag: "mo", output: "\u221D", tex: "propto", ttype: CONST},

//logical symbols
        {input: "and", tag: "mtext", output: "and", tex: null, ttype: SPACE},
        {input: "or", tag: "mtext", output: "or", tex: null, ttype: SPACE},
        {input: "not", tag: "mo", output: "\u00AC", tex: "neg", ttype: CONST},
        {input: "=>", tag: "mo", output: "\u21D2", tex: "implies", ttype: CONST},
        {input: "if", tag: "mo", output: "if", tex: null, ttype: SPACE},
        {input: "<=>", tag: "mo", output: "\u21D4", tex: "iff", ttype: CONST},
        {input: "AA", tag: "mo", output: "\u2200", tex: "forall", ttype: CONST},
        {input: "EE", tag: "mo", output: "\u2203", tex: "exists", ttype: CONST},
        {input: "!EE", tag: "mo", output: "\u2204", tex: "nexists", ttype: CONST},
        {input: "_|_", tag: "mo", output: "\u22A5", tex: "bot", ttype: CONST},
        {input: "TT", tag: "mo", output: "\u22A4", tex: "top", ttype: CONST},
        {input: "|--", tag: "mo", output: "\u22A2", tex: "vdash", ttype: CONST},
        {input: "|==", tag: "mo", output: "\u22A8", tex: "models", ttype: CONST},

//grouping brackets
        {input: "(", tag: "mo", output: "(", tex: "left(", ttype: LEFTBRACKET},
        {input: ")", tag: "mo", output: ")", tex: "right)", ttype: RIGHTBRACKET},
        {input: "[", tag: "mo", output: "[", tex: "left[", ttype: LEFTBRACKET},
        {input: "]", tag: "mo", output: "]", tex: "right]", ttype: RIGHTBRACKET},
        {input: "{", tag: "mo", output: "{", tex: null, ttype: LEFTBRACKET},
        {input: "}", tag: "mo", output: "}", tex: null, ttype: RIGHTBRACKET},
        {input: "|", tag: "mo", output: "|", tex: null, ttype: LEFTRIGHT},
        {input: ":|:", tag: "mo", output: "|", tex: null, ttype: CONST},
        {input: "|:", tag: "mo", output: "|", tex: null, ttype: LEFTBRACKET},
        {input: ":|", tag: "mo", output: "|", tex: null, ttype: RIGHTBRACKET},
//{input:"||", tag:"mo", output:"||", tex:null, ttype:LEFTRIGHT},
        {input: "(:", tag: "mo", output: "\u2329", tex: "langle", ttype: LEFTBRACKET},
        {input: ":)", tag: "mo", output: "\u232A", tex: "rangle", ttype: RIGHTBRACKET},
        {input: "<<", tag: "mo", output: "\u2329", tex: null, ttype: LEFTBRACKET},
        {input: ">>", tag: "mo", output: "\u232A", tex: null, ttype: RIGHTBRACKET},
        {input: "{:", tag: "mo", output: "{:", tex: null, ttype: LEFTBRACKET, invisible: true},
        {input: ":}", tag: "mo", output: ":}", tex: null, ttype: RIGHTBRACKET, invisible: true},

//miscellaneous symbols
        {input: "int", tag: "mo", output: "\u222B", tex: null, ttype: CONST},
        {input: "dx", tag: "mi", output: "{:d x:}", tex: null, ttype: DEFINITION},
        {input: "dy", tag: "mi", output: "{:d y:}", tex: null, ttype: DEFINITION},
        {input: "dz", tag: "mi", output: "{:d z:}", tex: null, ttype: DEFINITION},
        {input: "dt", tag: "mi", output: "{:d t:}", tex: null, ttype: DEFINITION},
        {input: "oint", tag: "mo", output: "\u222E", tex: null, ttype: CONST},
        {input: "del", tag: "mo", output: "\u2202", tex: "partial", ttype: CONST},
        {input: "grad", tag: "mo", output: "\u2207", tex: "nabla", ttype: CONST},
        {input: "+-", tag: "mo", output: "\u00B1", tex: "pm", ttype: CONST},
        {input: "O/", tag: "mo", output: "\u2205", tex: "emptyset", ttype: CONST},
        {input: "oo", tag: "mn", output: "\u221E", tex: "infty", ttype: CONST},
        {input: "aleph", tag: "mo", output: "\u2135", tex: null, ttype: CONST},
        {input: "...", tag: "mo", output: "...", tex: "ldots", ttype: CONST},
        {input: ":.", tag: "mo", output: "\u2234", tex: "therefore", ttype: CONST},
        {input: ":'", tag: "mo", output: "\u2235", tex: "because", ttype: CONST},
        {input: "/_", tag: "mo", output: "\u2220", tex: "angle", ttype: CONST},
        {input: "/_\\", tag: "mo", output: "\u25B3", tex: "triangle", ttype: CONST},
        {input: "'", tag: "mo", output: "\u2032", tex: "prime", ttype: CONST},
        {input: "''", tag: "mi", output: "\u2033", tex: "dprime", ttype: CONST},
        {input: "'''", tag: "mi", output: "\u2034", tex: "trprime", ttype: CONST},
        {input: "tilde", tag: "mover", output: "~", tex: null, ttype: UNARY, acc: true},
        {input: "\\ ", tag: "mo", output: "\u00A0", tex: null, ttype: CONST},
        {input: "frown", tag: "mo", output: "\u2322", tex: null, ttype: CONST},
        {input: "quad", tag: "mo", output: "\u00A0\u00A0", tex: null, ttype: CONST},
        {input: "qquad", tag: "mo", output: "\u00A0\u00A0\u00A0\u00A0", tex: null, ttype: CONST},
        {input: "cdots", tag: "mo", output: "\u22EF", tex: null, ttype: CONST},
        {input: "vdots", tag: "mo", output: "\u22EE", tex: null, ttype: CONST},
        {input: "ddots", tag: "mo", output: "\u22F1", tex: null, ttype: CONST},
        {input: "diamond", tag: "mo", output: "\u22C4", tex: null, ttype: CONST},
        {input: "square", tag: "mo", output: "\u25A1", tex: null, ttype: CONST},
        {input: "|__", tag: "mo", output: "\u230A", tex: "lfloor", ttype: CONST},
        {input: "__|", tag: "mo", output: "\u230B", tex: "rfloor", ttype: CONST},
        {input: "|~", tag: "mo", output: "\u2308", tex: "lceiling", ttype: CONST},
        {input: "~|", tag: "mo", output: "\u2309", tex: "rceiling", ttype: CONST},
        {input: "CC", tag: "mo", output: "\u2102", tex: null, ttype: CONST},
        {input: "NN", tag: "mo", output: "\u2115", tex: null, ttype: CONST},
        {input: "QQ", tag: "mo", output: "\u211A", tex: null, ttype: CONST},
        {input: "RR", tag: "mo", output: "\u211D", tex: null, ttype: CONST},
        {input: "ZZ", tag: "mo", output: "\u2124", tex: null, ttype: CONST},
        {input: "f", tag: "mi", output: "f", tex: null, ttype: UNARY, func: true},
        {input: "g", tag: "mi", output: "g", tex: null, ttype: UNARY, func: true},

//standard functions
        {input: "mod", tag: "mo", output: "mod", tex: null, ttype: CONST},
        {input: "min", tag: "mo", output: "min", tex: null, ttype: UNDEROVER},
        {input: "max", tag: "mo", output: "max", tex: null, ttype: UNDEROVER},
        {input: "exp", tag: "mo", output: "exp", tex: null, ttype: UNARY, func: true},
        {input: "norm", tag: "mo", output: "norm", tex: null, ttype: UNARY, rewriteleftright: ["\u2225", "\u2225"]},
        {input: "floor", tag: "mo", output: "floor", tex: null, ttype: UNARY, rewriteleftright: ["\u230A", "\u230B"]},
        {input: "ceil", tag: "mo", output: "ceil", tex: null, ttype: UNARY, rewriteleftright: ["\u2308", "\u2309"]},
        {input: "log", tag: "mo", output: "log", tex: null, ttype: UNARY, func: true},
        {input: "ln", tag: "mo", output: "ln", tex: null, ttype: UNARY, func: true},
        {input: "lim", tag: "mo", output: "lim", tex: null, ttype: UNDEROVER},
        {input: "sin", tag: "mo", output: "sin", tex: null, ttype: UNARY, func: true},
        {input: "cos", tag: "mo", output: "cos", tex: null, ttype: UNARY, func: true},
        {input: "tan", tag: "mo", output: "tan", tex: null, ttype: UNARY, func: true},
        {input: "tg", tag: "mo", output: "tg", tex: null, ttype: UNARY, func: true},
        {input: "cotan", tag: "mo", output: "cotan", tex: null, ttype: UNARY, func: true},
        {input: "cotg", tag: "mo", output: "cotg", tex: null, ttype: UNARY, func: true},
        {input: "sec", tag: "mo", output: "sec", tex: null, ttype: UNARY, func: true},
        {input: "cosec", tag: "mo", output: "cosec", tex: null, ttype: UNARY, func: true},
        {input: "arcsin", tag: "mo", output: "arcsin", tex: null, ttype: UNARY, func: true},
        {input: "arccos", tag: "mo", output: "arccos", tex: null, ttype: UNARY, func: true},
        {input: "arctan", tag: "mo", output: "arctan", tex: null, ttype: UNARY, func: true},
        {input: "arctg", tag: "mo", output: "arctg", tex: null, ttype: UNARY, func: true},
        {input: "arccotan", tag: "mo", output: "arccotan", tex: null, ttype: UNARY, func: true},
        {input: "arccotg", tag: "mo", output: "arccotg", tex: null, ttype: UNARY, func: true},
        {input: "arcsec", tag: "mo", output: "arcsec", tex: null, ttype: UNARY, func: true},
        {input: "arccosec", tag: "mo", output: "arccosec", tex: null, ttype: UNARY, func: true},
        {input: "sinh", tag: "mo", output: "sinh", tex: null, ttype: UNARY, func: true},
        {input: "cosh", tag: "mo", output: "cosh", tex: null, ttype: UNARY, func: true},
        {input: "tanh", tag: "mo", output: "tanh", tex: null, ttype: UNARY, func: true},
        {input: "cotanh", tag: "mo", output: "cotanh", tex: null, ttype: UNARY, func: true},
        {input: "sech", tag: "mo", output: "sech", tex: null, ttype: UNARY, func: true},
        {input: "cosech", tag: "mo", output: "cosech", tex: null, ttype: UNARY, func: true},
        {input: "arcsinh", tag: "mo", output: "arcsinh", tex: null, ttype: UNARY, func: true},
        {input: "arccosh", tag: "mo", output: "arccosh", tex: null, ttype: UNARY, func: true},
        {input: "arctanh", tag: "mo", output: "arctanh", tex: null, ttype: UNARY, func: true},
        {input: "arccotanh", tag: "mo", output: "arccotanh", tex: null, ttype: UNARY, func: true},
        {input: "arcsech", tag: "mo", output: "arcsech", tex: null, ttype: UNARY, func: true},
        {input: "arccosech", tag: "mo", output: "arccosech", tex: null, ttype: UNARY, func: true},
        {input: "det", tag: "mo", output: "det", tex: null, ttype: UNARY, func: true},
        {input: "dim", tag: "mo", output: "dim", tex: null, ttype: CONST},
        {input: "gcd", tag: "mo", output: "gcd", tex: null, ttype: UNARY, func: true},
        {input: "glb", tag: "mo", output: "glb", tex: null, ttype: CONST},
        {input: "lcm", tag: "mo", output: "lcm", tex: null, ttype: UNARY, func: true},
        {input: "lub", tag: "mo", output: "lub", tex: null, ttype: CONST},

//arrows
        {input: "uarr", tag: "mo", output: "\u2191", tex: "uparrow", ttype: CONST},
        {input: "darr", tag: "mo", output: "\u2193", tex: "downarrow", ttype: CONST},
        {input: "rarr", tag: "mo", output: "\u2192", tex: "rightarrow", ttype: CONST},
        {input: "->", tag: "mo", output: "\u2192", tex: "to", ttype: CONST},
        {input: ">->", tag: "mo", output: "\u21A3", tex: "rightarrowtail", ttype: CONST},
        {input: "->>", tag: "mo", output: "\u21A0", tex: "twoheadrightarrow", ttype: CONST},
        {input: ">->>", tag: "mo", output: "\u2916", tex: "twoheadrightarrowtail", ttype: CONST},
        {input: "|->", tag: "mo", output: "\u21A6", tex: "mapsto", ttype: CONST},
        {input: "larr", tag: "mo", output: "\u2190", tex: "leftarrow", ttype: CONST},
        {input: "harr", tag: "mo", output: "\u2194", tex: "leftrightarrow", ttype: CONST},
        {input: "rArr", tag: "mo", output: "\u21D2", tex: "Rightarrow", ttype: CONST},
        {input: "lArr", tag: "mo", output: "\u21D0", tex: "Leftarrow", ttype: CONST},
        {input: "hArr", tag: "mo", output: "\u21D4", tex: "Leftrightarrow", ttype: CONST},
//commands with argument
        {input: "sqrt", tag: "msqrt", output: "sqrt", tex: null, ttype: UNARY},
        {input: "root", tag: "mroot", output: "root", tex: null, ttype: BINARY},
        {input: "frac", tag: "mfrac", output: "/", tex: null, ttype: BINARY},
        {input: "/", tag: "mfrac", output: "/", tex: null, ttype: INFIX},
        {input: "stackrel", tag: "mover", output: "stackrel", tex: null, ttype: BINARY},
        {input: "overset", tag: "mover", output: "stackrel", tex: null, ttype: BINARY},
        {input: "underset", tag: "munder", output: "stackrel", tex: null, ttype: BINARY},
        {input: "_", tag: "msub", output: "_", tex: null, ttype: INFIX},
        {input: "^", tag: "msup", output: "^", tex: null, ttype: INFIX},
        {input: "hat", tag: "mover", output: "\u005E", tex: null, ttype: UNARY, acc: true},
        {input: "bar", tag: "mover", output: "\u00AF", tex: "overline", ttype: UNARY, acc: true},
        {input: "vec", tag: "mover", output: "\u2192", tex: null, ttype: UNARY, acc: true},
        {input: "dot", tag: "mover", output: ".", tex: null, ttype: UNARY, acc: true},
        {input: "ddot", tag: "mover", output: "..", tex: null, ttype: UNARY, acc: true},
        {input: "ul", tag: "munder", output: "\u0332", tex: "underline", ttype: UNARY, acc: true},
        {input: "ubrace", tag: "munder", output: "\u23DF", tex: "underbrace", ttype: UNARYUNDEROVER, acc: true},
        {input: "obrace", tag: "mover", output: "\u23DE", tex: "overbrace", ttype: UNARYUNDEROVER, acc: true},
        {input: "text", tag: "mtext", output: "text", tex: null, ttype: TEXT},
        {input: "mbox", tag: "mtext", output: "mbox", tex: null, ttype: TEXT},
        {input: "color", tag: "mstyle", ttype: BINARY},
        {input: "cancel", tag: "menclose", output: "cancel", tex: null, ttype: UNARY},
        AMquote,
        {input: "bb", tag: "mstyle", atname: "mathvariant", atval: "bold", output: "bb", tex: null, ttype: UNARY},
        {
            input: "mathbf",
            tag: "mstyle",
            atname: "mathvariant",
            atval: "bold",
            output: "mathbf",
            tex: null,
            ttype: UNARY
        },
        {input: "sf", tag: "mstyle", atname: "mathvariant", atval: "sans-serif", output: "sf", tex: null, ttype: UNARY},
        {
            input: "mathsf",
            tag: "mstyle",
            atname: "mathvariant",
            atval: "sans-serif",
            output: "mathsf",
            tex: null,
            ttype: UNARY
        },
        {
            input: "bbb",
            tag: "mstyle",
            atname: "mathvariant",
            atval: "double-struck",
            output: "bbb",
            tex: null,
            ttype: UNARY,
            codes: AMbbb
        },
        {
            input: "mathbb",
            tag: "mstyle",
            atname: "mathvariant",
            atval: "double-struck",
            output: "mathbb",
            tex: null,
            ttype: UNARY,
            codes: AMbbb
        },
        {
            input: "cc",
            tag: "mstyle",
            atname: "mathvariant",
            atval: "script",
            output: "cc",
            tex: null,
            ttype: UNARY,
            codes: AMcal
        },
        {
            input: "mathcal",
            tag: "mstyle",
            atname: "mathvariant",
            atval: "script",
            output: "mathcal",
            tex: null,
            ttype: UNARY,
            codes: AMcal
        },
        {input: "tt", tag: "mstyle", atname: "mathvariant", atval: "monospace", output: "tt", tex: null, ttype: UNARY},
        {
            input: "mathtt",
            tag: "mstyle",
            atname: "mathvariant",
            atval: "monospace",
            output: "mathtt",
            tex: null,
            ttype: UNARY
        },
        {
            input: "fr",
            tag: "mstyle",
            atname: "mathvariant",
            atval: "fraktur",
            output: "fr",
            tex: null,
            ttype: UNARY,
            codes: AMfrk
        },
        {
            input: "mathfrak",
            tag: "mstyle",
            atname: "mathvariant",
            atval: "fraktur",
            output: "mathfrak",
            tex: null,
            ttype: UNARY,
            codes: AMfrk
        }
    ]

    const AMnames = [] //list of input symbols

    function initSymbols() {
        for (let i = 0; i < AMsymbols.length; i++) {
            if (AMsymbols[i].tex) {
                AMsymbols.push({
                    input: AMsymbols[i].tex,
                    tag: AMsymbols[i].tag, output: AMsymbols[i].output, ttype: AMsymbols[i].ttype,
                    acc: (AMsymbols[i].acc || false)
                })
            }
        }

        AMsymbols.sort(function (s1, s2) {
            if (s1.input > s2.input) return 1
            else return -1
        })
        for (let j = 0; j < AMsymbols.length; j++) AMnames[j] = AMsymbols[j].input
    }

    function AMremoveCharsAndBlanks(str, n) {
//remove n characters and any following blanks
        let st
        if (str.charAt(n) === "\\" && str.charAt(n + 1) !== "\\" && str.charAt(n + 1) !== " ")
            st = str.slice(n + 1)
        else st = str.slice(n)
        for (var i = 0; i < st.length && st.charCodeAt(i) <= 32; i = i + 1) {
        }
        return st.slice(i)
    }

    function position(arr, str, n) {
// return position >=n where str appears or would be inserted
// assumes arr is sorted
        if (n === 0) {
            let h, m
            n = -1
            h = arr.length
            while (n + 1 < h) {
                m = (n + h) >> 1
                if (arr[m] < str) n = m
                else h = m
            }
            return h
        } else
            for (var i = n; i < arr.length && arr[i] < str; i++) {
            }
        return i // i=arr.length || arr[i]>=str
    }

    function AMgetSymbol(str) {
//return maximal initial substring of str that appears in names
//return null if there is none
        let k = 0 //new pos
        let j = 0 //old pos
        let mk  //match pos
        let st
        let tagst
        let match = ""
        let more = true
        for (let i = 1; i <= str.length && more; i++) {
            st = str.slice(0, i) //initial substring of length i
            j = k
            k = position(AMnames, st, j)
            if (k < AMnames.length && str.slice(0, AMnames[k].length) === AMnames[k]) {
                match = AMnames[k]
                mk = k
                i = match.length
            }
            more = k < AMnames.length && str.slice(0, AMnames[k].length) >= AMnames[k]
        }
        AMpreviousSymbol = AMcurrentSymbol
        if (match !== "") {
            AMcurrentSymbol = AMsymbols[mk].ttype
            return AMsymbols[mk]
        }
// if str[0] is a digit or - return maxsubstring of digits.digits
        AMcurrentSymbol = CONST
        k = 1
        st = str.slice(0, 1)
        let integ = true
        while ("0" <= st && st <= "9" && k <= str.length) {
            st = str.slice(k, k + 1)
            k++
        }
        if (st === ".") {
            st = str.slice(k, k + 1)
            if ("0" <= st && st <= "9") {
                integ = false
                k++
                while ("0" <= st && st <= "9" && k <= str.length) {
                    st = str.slice(k, k + 1)
                    k++
                }
            }
        }
        if ((integ && k > 1) || k > 2) {
            st = str.slice(0, k - 1)
            tagst = "mn"
        } else {
            st = str.slice(0, 1) //take 1 character
            tagst = (("A" > st || st > "Z") && ("a" > st || st > "z") ? "mo" : "mi")
        }
        if (st === "-" && AMpreviousSymbol === INFIX) {
            AMcurrentSymbol = INFIX  //trick "/" into recognizing "-" on second parse
            return {input: st, tag: tagst, output: st, ttype: UNARY, func: true}
        }
        return {input: st, tag: tagst, output: st, ttype: CONST}
    }

    function AMremoveBrackets(node) {
        let st
        if (!node.hasChildNodes()) {
            return
        }
        if (node.firstChild.hasChildNodes() && (node.nodeName === "mrow" || node.nodeName === "M:MROW")) {
            st = node.firstChild.firstChild.nodeValue
            if (st === "(" || st === "[" || st === "{") node.removeChild(node.firstChild)
        }
        if (node.lastChild.hasChildNodes() && (node.nodeName === "mrow" || node.nodeName === "M:MROW")) {
            st = node.lastChild.firstChild.nodeValue
            if (st === ")" || st === "]" || st === "}") node.removeChild(node.lastChild)
        }
    }

    var AMnestingDepth, AMpreviousSymbol, AMcurrentSymbol

    function AMparseSexpr(str) { //parses str and returns [node,tailstr]
        let symbol, node, result, i, st
        const newFrag = document.createDocumentFragment()
        str = AMremoveCharsAndBlanks(str, 0)
        symbol = AMgetSymbol(str)             //either a token or a bracket or empty
        if (symbol == null || symbol.ttype === RIGHTBRACKET && AMnestingDepth > 0) {
            return [null, str]
        }
        if (symbol.ttype === DEFINITION) {
            str = symbol.output + AMremoveCharsAndBlanks(str, symbol.input.length)
            symbol = AMgetSymbol(str)
        }
        switch (symbol.ttype) {
            case UNDEROVER:
            case CONST:
                str = AMremoveCharsAndBlanks(str, symbol.input.length)
                return [createMmlNode(symbol.tag,        //its a constant
                    document.createTextNode(symbol.output)), str]
            case LEFTBRACKET:   //read (expr+)
                AMnestingDepth++
                str = AMremoveCharsAndBlanks(str, symbol.input.length)
                result = AMparseExpr(str, true)
                AMnestingDepth--
                if (typeof symbol.invisible === "boolean" && symbol.invisible)
                    node = createMmlNode("mrow", result[0])
                else {
                    node = createMmlNode("mo", document.createTextNode(symbol.output))
                    node = createMmlNode("mrow", node)
                    node.appendChild(result[0])
                }
                return [node, result[1]]
            case TEXT:
                if (symbol !== AMquote) str = AMremoveCharsAndBlanks(str, symbol.input.length)
                if (str.charAt(0) === "{") i = str.indexOf("}")
                else if (str.charAt(0) === "(") i = str.indexOf(")")
                else if (str.charAt(0) === "[") i = str.indexOf("]")
                else if (symbol === AMquote) i = str.slice(1).indexOf("\"") + 1
                else i = 0
                if (i === -1) i = str.length
                st = str.slice(1, i)
                if (st.charAt(0) === " ") {
                    node = createMmlNode("mspace")
                    node.setAttribute("width", "1ex")
                    newFrag.appendChild(node)
                }
                newFrag.appendChild(
                    createMmlNode(symbol.tag, document.createTextNode(st)))
                if (st.charAt(st.length - 1) === " ") {
                    node = createMmlNode("mspace")
                    node.setAttribute("width", "1ex")
                    newFrag.appendChild(node)
                }
                str = AMremoveCharsAndBlanks(str, i + 1)
                return [createMmlNode("mrow", newFrag), str]
            case UNARYUNDEROVER:
            case UNARY:
                str = AMremoveCharsAndBlanks(str, symbol.input.length)
                result = AMparseSexpr(str)
                if (result[0] == null) return [createMmlNode(symbol.tag,
                    document.createTextNode(symbol.output)), str]
                if (typeof symbol.func === "boolean" && symbol.func) { // functions hack
                    st = str.charAt(0)
                    if (st === "^" || st === "_" || st === "/" || st === "|" || st === "," ||
                        (symbol.input.length === 1 && symbol.input.match(/\w/) && st !== "(")) {
                        return [createMmlNode(symbol.tag,
                            document.createTextNode(symbol.output)), str]
                    } else {
                        node = createMmlNode("mrow",
                            createMmlNode(symbol.tag, document.createTextNode(symbol.output)))
                        node.appendChild(result[0])
                        return [node, result[1]]
                    }
                }
                AMremoveBrackets(result[0])
                if (symbol.input === "sqrt") {           // sqrt
                    return [createMmlNode(symbol.tag, result[0]), result[1]]
                } else if (typeof symbol.rewriteleftright !== "undefined") {    // abs, floor, ceil
                    node = createMmlNode("mrow", createMmlNode("mo", document.createTextNode(symbol.rewriteleftright[0])))
                    node.appendChild(result[0])
                    node.appendChild(createMmlNode("mo", document.createTextNode(symbol.rewriteleftright[1])))
                    return [node, result[1]]
                } else if (symbol.input === "cancel") {   // cancel
                    node = createMmlNode(symbol.tag, result[0])
                    node.setAttribute("notation", "updiagonalstrike")
                    return [node, result[1]]
                } else if (typeof symbol.acc === "boolean" && symbol.acc) {   // accent
                    node = createMmlNode(symbol.tag, result[0])
                    const accnode = createMmlNode("mo", document.createTextNode(symbol.output))
                    if (symbol.input === "vec" && (
                            (result[0].nodeName === "mrow" && result[0].childNodes.length === 1
                                && result[0].firstChild.firstChild.nodeValue !== null
                                && result[0].firstChild.firstChild.nodeValue.length === 1) ||
                            (result[0].firstChild.nodeValue !== null
                                && result[0].firstChild.nodeValue.length === 1))) {
                        accnode.setAttribute("stretchy", false)
                    }
                    node.appendChild(accnode)
                    return [node, result[1]]
                } else {                        // font change command
                    if (typeof symbol.codes !== "undefined") {
                        for (i = 0; i < result[0].childNodes.length; i++)
                            if (result[0].childNodes[i].nodeName === "mi" || result[0].nodeName === "mi") {
                                st = (result[0].nodeName === "mi" ? result[0].firstChild.nodeValue :
                                    result[0].childNodes[i].firstChild.nodeValue)
                                let newst = []
                                for (let j = 0; j < st.length; j++)
                                    if (st.charCodeAt(j) > 64 && st.charCodeAt(j) < 91)
                                        newst = newst + symbol.codes[st.charCodeAt(j) - 65]
                                    else if (st.charCodeAt(j) > 96 && st.charCodeAt(j) < 123)
                                        newst = newst + symbol.codes[st.charCodeAt(j) - 71]
                                    else newst = newst + st.charAt(j)
                                if (result[0].nodeName === "mi")
                                    result[0] = createMmlNode("mo").appendChild(document.createTextNode(newst))
                                else result[0].replaceChild(createMmlNode("mo").appendChild(document.createTextNode(newst)),
                                    result[0].childNodes[i])
                            }
                    }
                    node = createMmlNode(symbol.tag, result[0])
                    node.setAttribute(symbol.atname, symbol.atval)
                    return [node, result[1]]
                }
            case BINARY:
                str = AMremoveCharsAndBlanks(str, symbol.input.length)
                result = AMparseSexpr(str)
                if (result[0] == null) return [createMmlNode("mo",
                    document.createTextNode(symbol.input)), str]
                AMremoveBrackets(result[0])
                const result2 = AMparseSexpr(result[1])
                if (result2[0] == null) return [createMmlNode("mo",
                    document.createTextNode(symbol.input)), str]
                AMremoveBrackets(result2[0])
                if (symbol.input === "color") {
                    if (str.charAt(0) === "{") i = str.indexOf("}")
                    else if (str.charAt(0) === "(") i = str.indexOf(")")
                    else if (str.charAt(0) === "[") i = str.indexOf("]")
                    st = str.slice(1, i)
                    node = createMmlNode(symbol.tag, result2[0])
                    node.setAttribute("mathcolor", st)
                    return [node, result2[1]]
                }
                if (symbol.input === "root" || symbol.output === "stackrel")
                    newFrag.appendChild(result2[0])
                newFrag.appendChild(result[0])
                if (symbol.input === "frac") newFrag.appendChild(result2[0])
                return [createMmlNode(symbol.tag, newFrag), result2[1]]
            case INFIX:
                str = AMremoveCharsAndBlanks(str, symbol.input.length)
                return [createMmlNode("mo", document.createTextNode(symbol.output)), str]
            case SPACE:
                str = AMremoveCharsAndBlanks(str, symbol.input.length)
                node = createMmlNode("mspace")
                node.setAttribute("width", "1ex")
                newFrag.appendChild(node)
                newFrag.appendChild(
                    createMmlNode(symbol.tag, document.createTextNode(symbol.output)))
                node = createMmlNode("mspace")
                node.setAttribute("width", "1ex")
                newFrag.appendChild(node)
                return [createMmlNode("mrow", newFrag), str]
            case LEFTRIGHT:
                AMnestingDepth++
                str = AMremoveCharsAndBlanks(str, symbol.input.length)
                result = AMparseExpr(str, false)
                AMnestingDepth--
                st = ""
                if (result[0].lastChild != null)
                    st = result[0].lastChild.firstChild.nodeValue
                if (st === "|" && str.charAt(0) !== ",") { // its an absolute value subterm
                    node = createMmlNode("mo", document.createTextNode(symbol.output))
                    node = createMmlNode("mrow", node)
                    node.appendChild(result[0])
                    return [node, result[1]]
                } else { // the "|" is a \mid so use unicode 2223 (divides) for spacing
                    node = createMmlNode("mo", document.createTextNode("\u2223"))
                    node = createMmlNode("mrow", node)
                    return [node, str]
                }
            default:
                str = AMremoveCharsAndBlanks(str, symbol.input.length)
                return [createMmlNode(symbol.tag,        //its a constant
                    document.createTextNode(symbol.output)), str]
        }
    }

    function AMparseIexpr(str) {
        let symbol, sym1, sym2, node, result, underover
        str = AMremoveCharsAndBlanks(str, 0)
        sym1 = AMgetSymbol(str)
        result = AMparseSexpr(str)
        node = result[0]
        str = result[1]
        symbol = AMgetSymbol(str)
        if (symbol.ttype === INFIX && symbol.input !== "/") {
            str = AMremoveCharsAndBlanks(str, symbol.input.length)
            result = AMparseSexpr(str)
            if (result[0] == null) // show box in place of missing argument
                result[0] = createMmlNode("mo", document.createTextNode("\u25A1"))
            else AMremoveBrackets(result[0])
            str = result[1]
            underover = (sym1.ttype === UNDEROVER || sym1.ttype === UNARYUNDEROVER)
            if (symbol.input === "_") {
                sym2 = AMgetSymbol(str)
                if (sym2.input === "^") {
                    str = AMremoveCharsAndBlanks(str, sym2.input.length)
                    const res2 = AMparseSexpr(str)
                    AMremoveBrackets(res2[0])
                    str = res2[1]
                    node = createMmlNode((underover ? "munderover" : "msubsup"), node)
                    node.appendChild(result[0])
                    node.appendChild(res2[0])
                    node = createMmlNode("mrow", node) // so sum does not stretch
                } else {
                    node = createMmlNode((underover ? "munder" : "msub"), node)
                    node.appendChild(result[0])
                }
            } else if (symbol.input === "^" && underover) {
                node = createMmlNode("mover", node)
                node.appendChild(result[0])
            } else {
                node = createMmlNode(symbol.tag, node)
                node.appendChild(result[0])
            }
            if (typeof sym1.func !== "undefined" && sym1.func) {
                sym2 = AMgetSymbol(str)
                if (sym2.ttype !== INFIX && sym2.ttype !== RIGHTBRACKET) {
                    result = AMparseIexpr(str)
                    node = createMmlNode("mrow", node)
                    node.appendChild(result[0])
                    str = result[1]
                }
            }
        }
        return [node, str]
    }

    function AMparseExpr(str, rightbracket) {
        let symbol, node, result, i
        const newFrag = document.createDocumentFragment()
        do {
            str = AMremoveCharsAndBlanks(str, 0)
            result = AMparseIexpr(str)
            node = result[0]
            str = result[1]
            symbol = AMgetSymbol(str)
            if (symbol.ttype === INFIX && symbol.input === "/") {
                str = AMremoveCharsAndBlanks(str, symbol.input.length)
                result = AMparseIexpr(str)
                if (result[0] == null) // show box in place of missing argument
                    result[0] = createMmlNode("mo", document.createTextNode("\u25A1"))
                else AMremoveBrackets(result[0])
                str = result[1]
                AMremoveBrackets(node)
                node = createMmlNode(symbol.tag, node)
                node.appendChild(result[0])
                newFrag.appendChild(node)
                symbol = AMgetSymbol(str)
            }
            else if (node != undefined) newFrag.appendChild(node)
        } while ((symbol.ttype !== RIGHTBRACKET &&
            (symbol.ttype !== LEFTRIGHT || rightbracket)
            || AMnestingDepth === 0) && symbol != null && symbol.output !== "")
        if (symbol.ttype === RIGHTBRACKET || symbol.ttype === LEFTRIGHT) {
            const len = newFrag.childNodes.length
            if (len > 0 && newFrag.childNodes[len - 1].nodeName === "mrow"
                && newFrag.childNodes[len - 1].lastChild
                && newFrag.childNodes[len - 1].lastChild.firstChild) { //matrix
                const right = newFrag.childNodes[len - 1].lastChild.firstChild.nodeValue
                if (right === ")" || right === "]") {
                    const left = newFrag.childNodes[len - 1].firstChild.firstChild.nodeValue
                    if (left === "(" && right === ")" && symbol.output !== "}" ||
                        left === "[" && right === "]") {
                        const pos = [] // positions of commas
                        let matrix = true
                        const m = newFrag.childNodes.length
                        for (i = 0; matrix && i < m; i = i + 2) {
                            pos[i] = []
                            node = newFrag.childNodes[i]
                            if (matrix) matrix = node.nodeName === "mrow" &&
                                (i === m - 1 || node.nextSibling.nodeName === "mo" &&
                                    node.nextSibling.firstChild.nodeValue === ",") &&
                                node.firstChild.firstChild.nodeValue === left &&
                                node.lastChild.firstChild.nodeValue === right
                            if (matrix)
                                for (var j = 0; j < node.childNodes.length; j++)
                                    if (node.childNodes[j].firstChild.nodeValue === ",")
                                        pos[i][pos[i].length] = j
                            if (matrix && i > 1) matrix = pos[i].length === pos[i - 2].length
                        }
                        matrix = matrix && (pos.length > 1 || pos[0].length > 0)
                        const columnlines = []
                        if (matrix) {
                            let row, frag, n, k
                            const table = document.createDocumentFragment()
                            for (i = 0; i < m; i = i + 2) {
                                row = document.createDocumentFragment()
                                frag = document.createDocumentFragment()
                                node = newFrag.firstChild // <mrow>(-,-,...,-,-)</mrow>
                                n = node.childNodes.length
                                k = 0
                                node.removeChild(node.firstChild) //remove (
                                for (j = 1; j < n - 1; j++) {
                                    if (typeof pos[i][k] !== "undefined" && j === pos[i][k]) {
                                        node.removeChild(node.firstChild) //remove ,
                                        if (node.firstChild.nodeName === "mrow" && node.firstChild.childNodes.length === 1 &&
                                            node.firstChild.firstChild.firstChild.nodeValue === "\u2223") {
                                            //is columnline marker - skip it
                                            if (i === 0) {
                                                columnlines.push("solid")
                                            }
                                            node.removeChild(node.firstChild) //remove mrow
                                            node.removeChild(node.firstChild) //remove ,
                                            j += 2
                                            k++
                                        } else if (i === 0) {
                                            columnlines.push("none")
                                        }
                                        row.appendChild(createMmlNode("mtd", frag))
                                        k++
                                    } else frag.appendChild(node.firstChild)
                                }
                                row.appendChild(createMmlNode("mtd", frag))
                                if (i === 0) {
                                    columnlines.push("none")
                                }
                                if (newFrag.childNodes.length > 2) {
                                    newFrag.removeChild(newFrag.firstChild) //remove <mrow>)</mrow>
                                    newFrag.removeChild(newFrag.firstChild) //remove <mo>,</mo>
                                }
                                table.appendChild(createMmlNode("mtr", row))
                            }
                            node = createMmlNode("mtable", table)
                            node.setAttribute("columnlines", columnlines.join(" "))
                            if (typeof symbol.invisible === "boolean" && symbol.invisible) node.setAttribute("columnalign", "left")
                            newFrag.replaceChild(node, newFrag.firstChild)
                        }
                    }
                }
            }
            str = AMremoveCharsAndBlanks(str, symbol.input.length)
            if (typeof symbol.invisible !== "boolean" || !symbol.invisible) {
                node = createMmlNode("mo", document.createTextNode(symbol.output))
                newFrag.appendChild(node)
            }
        }
        return [newFrag, str]
    }

    function parseMath(str) {
        let frag, node
        AMnestingDepth = 0
        frag = AMparseExpr(str.replace(/^\s+/g, ""), false)[0]
        node = createMmlNode("math", frag)
        node.setAttribute("displaystyle", "true")
        return node
    }

    function strarr2docFrag(arr, linebreaks) {
        const newFrag = document.createDocumentFragment()
        let expr = false
        for (let i = 0; i < arr.length; i++) {
            if (expr) newFrag.appendChild(parseMath(arr[i]))
            else {
                const arri = (linebreaks ? arr[i].split("\n\n") : [arr[i]])
                newFrag.appendChild(createElementXHTML("span").appendChild(document.createTextNode(arri[0])))
                for (let j = 1; j < arri.length; j++) {
                    newFrag.appendChild(createElementXHTML("p"))
                    newFrag.appendChild(createElementXHTML("span").appendChild(document.createTextNode(arri[j])))
                }
            }
            expr = !expr
        }
        return newFrag
    }

    function processNodeR(n, linebreaks) {
        let mtch, str, arr, frg, i
        if (n.childNodes.length === 0) {
            if ((n.nodeType !== 8 || linebreaks) &&
                n.parentNode.nodeName !== "form" && n.parentNode.nodeName !== "FORM" &&
                n.parentNode.nodeName !== "textarea" && n.parentNode.nodeName !== "TEXTAREA") {
                str = n.nodeValue
                if (str != null) {
                    str = str.replace(/\r\n\r\n/g, "\n\n")
                    str = str.replace(/\x20+/g, " ")
                    str = str.replace(/\s*\r\n/g, " ")
                    mtch = false
                    str = str.replace(new RegExp(AMescape1, "g"),
                        function () {
                            mtch = true
                            return "AMescape1"
                        })
                    arr = str.split(AMdelimiter1)
                    str = arr.join(AMdelimiter1)
                    arr = str.split(AMdelimiter1)
                    for (i = 0; i < arr.length; i++) // this is a problem ************
                        arr[i] = arr[i].replace(/AMescape1/g, AMdelimiter1)
                    if (arr.length > 1 || mtch) {
                        frg = strarr2docFrag(arr, n.nodeType === 8)
                        const len = frg.childNodes.length
                        n.parentNode.replaceChild(frg, n)
                        return len - 1
                    }
                }
            } else return 0
        } else if (n.nodeName !== "math") {
            for (i = 0; i < n.childNodes.length; i++)
                i += processNodeR(n.childNodes[i], linebreaks)
        }
        return 0
    }

    function AMprocessNode(n, linebreaks, spanclassAM) {
        let frag, st
        if (spanclassAM != null) {
            frag = document.getElementsByTagName("span")
            for (let i = 0; i < frag.length; i++)
                if (frag[i].className === "AM")
                    processNodeR(frag[i], linebreaks)
        } else {
            st = n.innerHTML // look for AMdelimiter on page
            if (st == null ||
                st.indexOf(AMdelimiter1 + " ") !== -1 || st.slice(-1) === AMdelimiter1 ||
                st.indexOf(AMdelimiter1 + "<") !== -1 || st.indexOf(AMdelimiter1 + "\n") !== -1) {
                processNodeR(n, linebreaks)
            }
        }
    }

//setup onload function
    window.addEventListener("load", initSymbols, false)

//expose some functions to outside
    asciimath.processNode = AMprocessNode
    asciimath.parseMath = parseMath
})()