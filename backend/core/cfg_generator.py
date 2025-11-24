import random
from typing import List, Dict, Tuple, Literal, Set
from enum import Enum

class GrammarMode(str, Enum):
    NUMERIC = "numeric"
    ALPHABETIC = "alphabetic"
    ALPHANUMERIC = "alphanumeric"
    SYMBOLIC = "symbolic"

class CFGGenerator:
    """Context-Free Grammar generator for cryptographic keys"""
    
    def __init__(self, modes: List[GrammarMode] = None):
        if modes is None:
            modes = [GrammarMode.ALPHANUMERIC]
        self.modes = set(modes) if isinstance(modes, list) else {modes}
        self.grammar = self._build_grammar()
    
    def _build_grammar(self) -> Dict[str, List[List[str]]]:
        """Build CFG rules based on selected modes"""
        grammar = {
            "Start": []  # Start symbol - using descriptive name
        }
        
        # Collect all available terminals
        terminals = []
        
        if GrammarMode.NUMERIC in self.modes:
            terminals.extend([["0"], ["1"], ["2"], ["3"], ["4"], ["5"], ["6"], ["7"], ["8"], ["9"]])
        
        if GrammarMode.ALPHABETIC in self.modes:
            terminals.extend([
                ["a"], ["b"], ["c"], ["d"], ["e"], ["f"], ["g"], ["h"], ["i"], ["j"],
                ["k"], ["l"], ["m"], ["n"], ["o"], ["p"], ["q"], ["r"], ["s"], ["t"],
                ["u"], ["v"], ["w"], ["x"], ["y"], ["z"],
                ["A"], ["B"], ["C"], ["D"], ["E"], ["F"], ["G"], ["H"], ["I"], ["J"],
                ["K"], ["L"], ["M"], ["N"], ["O"], ["P"], ["Q"], ["R"], ["S"], ["T"],
                ["U"], ["V"], ["W"], ["X"], ["Y"], ["Z"]
            ])
        
        if GrammarMode.ALPHANUMERIC in self.modes:
            terminals.extend([
                ["0"], ["1"], ["2"], ["3"], ["4"], ["5"], ["6"], ["7"], ["8"], ["9"],
                ["a"], ["b"], ["c"], ["d"], ["e"], ["f"], ["g"], ["h"], ["i"], ["j"],
                ["k"], ["l"], ["m"], ["n"], ["o"], ["p"], ["q"], ["r"], ["s"], ["t"],
                ["u"], ["v"], ["w"], ["x"], ["y"], ["z"],
                ["A"], ["B"], ["C"], ["D"], ["E"], ["F"], ["G"], ["H"], ["I"], ["J"],
                ["K"], ["L"], ["M"], ["N"], ["O"], ["P"], ["Q"], ["R"], ["S"], ["T"],
                ["U"], ["V"], ["W"], ["X"], ["Y"], ["Z"]
            ])
        
        if GrammarMode.SYMBOLIC in self.modes:
            terminals.extend([
                ["!"], ["@"], ["#"], ["$"], ["%"], ["^"], ["&"], ["*"],
                ["("], [")"], ["-"], ["_"], ["="], ["+"], ["["], ["]"],
                ["{"], ["}"], ["|"], ["\\"], [";"], [":"], ["'"], ['"'],
                [","], ["."], ["<"], [">"], ["/"], ["?"], ["~"], ["`"]
            ])
        
        # Remove duplicates while preserving order
        seen = set()
        unique_terminals = []
        for term in terminals:
            term_str = str(term)
            if term_str not in seen:
                seen.add(term_str)
                unique_terminals.append(term)
        
        if not unique_terminals:
            # Default to alphanumeric if no modes selected
            unique_terminals = [
                ["0"], ["1"], ["2"], ["3"], ["4"], ["5"], ["6"], ["7"], ["8"], ["9"],
                ["a"], ["b"], ["c"], ["d"], ["e"], ["f"], ["g"], ["h"], ["i"], ["j"],
                ["k"], ["l"], ["m"], ["n"], ["o"], ["p"], ["q"], ["r"], ["s"], ["t"],
                ["u"], ["v"], ["w"], ["x"], ["y"], ["z"],
                ["A"], ["B"], ["C"], ["D"], ["E"], ["F"], ["G"], ["H"], ["I"], ["J"],
                ["K"], ["L"], ["M"], ["N"], ["O"], ["P"], ["Q"], ["R"], ["S"], ["T"],
                ["U"], ["V"], ["W"], ["X"], ["Y"], ["Z"]
            ]
        
        # Build grammar with Terminal (descriptive name) symbol
        grammar["Start"] = [
            ["Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal"],
            ["Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal"],
            ["Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal"],
            ["Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal", "Terminal"]
        ]
        grammar["Terminal"] = unique_terminals
        
        return grammar
    
    def generate_key(self, length: int = None) -> Tuple[str, List[Dict]]:
        """
        Generate a key using randomized CFG derivation
        Returns: (generated_key, parse_steps)
        """
        parse_steps = []
        current_symbols = ["Start"]
        step_num = 0
        
        # Initial step
        parse_steps.append({
            "step": step_num,
            "symbols": current_symbols.copy(),
            "rule_applied": "Start: Start",
            "result": "".join(current_symbols)
        })
        
        # Derive until all terminals
        while any(sym in self.grammar for sym in current_symbols):
            step_num += 1
            new_symbols = []
            rule_applied = []
            
            for symbol in current_symbols:
                if symbol in self.grammar:
                    # Choose random production rule
                    if symbol == "Start" and length:
                        chosen_production = ["Terminal"] * max(1, length)
                    else:
                        productions = self.grammar[symbol]
                        chosen_production = random.choice(productions)
                    new_symbols.extend(chosen_production)
                    rule_applied.append(f"{symbol} → {' '.join(chosen_production)}")
                else:
                    # Terminal symbol, keep as is
                    new_symbols.append(symbol)
            
            current_symbols = new_symbols
            
            parse_steps.append({
                "step": step_num,
                "symbols": current_symbols.copy(),
                "rule_applied": " | ".join(rule_applied) if rule_applied else "Terminal",
                "result": "".join(current_symbols)
            })
        
        # Final key is all terminals joined (single source of truth)
        generated_key = "".join(current_symbols)
        if parse_steps:
            parse_steps[-1]["result"] = generated_key
        
        return generated_key, parse_steps
