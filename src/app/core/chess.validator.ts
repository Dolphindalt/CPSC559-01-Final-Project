import { Directive, OnInit } from "@angular/core";
import { FormControl, NG_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";
const Chess = require('chess.js');

@Directive({
    selector: '[validgame]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: ChessValidatorDirective, multi: true }
    ]
})
export class ChessValidatorDirective implements Validator, OnInit {

    private chess: any;

    public ngOnInit(): void {
        this.chess = Chess.Chess();
    }

    public validate(control: FormControl): ValidationErrors | null {
        let value: string | null = control.value;
        if (value != null && !this.chess.load_pgn(value, { sloppy: true })) {
            return { invalid: true, chess: true }
        }
        return null;
    }

}