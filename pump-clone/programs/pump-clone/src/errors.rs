use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorsCode {
    #[msg("Bounding Curve is full")]
    BoundingCurveFull,
    #[msg("Bounding Curve is not full")]
    NotGraduatedYet,
    #[msg("Slippage tolerance exceeded - try increasing slippage")]
    SlippageExceeded,
    #[msg("Minimum output must be greater than zero")]
    InvalidMinOutput,
}
