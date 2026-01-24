use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Bounding Curve is full")]
    BoundingCurveFull,
    #[msg("Bounding Curve is not full")]
    NotGraduatedYet,
}
