import PhoneInput, { isValidPhoneNumber, type Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const PRIORITY: Country[] = [
  "CI", "FR", "US", "SN", "ML", "BF", "GH", "NG",
  "CM", "CD", "GA", "TG", "BJ", "GN", "GB", "CA",
  "BE", "CH", "MA", "DZ", "TN",
];

interface Props {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  defaultCountry?: Country;
  showError?: boolean;
  errorMessage?: string;
  className?: string;
}

/**
 * International phone input styled to match MonInvit's design system.
 * Values are stored in E.164 format (e.g. +2250712345678).
 */
export function PhoneField({
  value,
  onChange,
  placeholder = "Numéro de téléphone",
  defaultCountry = "CI",
  showError,
  errorMessage = "Format de numéro invalide",
  className,
}: Props) {
  const invalid = showError && value ? !isValidPhoneNumber(value) : false;

  return (
    <div className={className}>
      <PhoneInput
        international
        defaultCountry={defaultCountry}
        countryOptionsOrder={PRIORITY}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        data-invalid={invalid || undefined}
      />
      {invalid ? (
        <p className="mt-1 text-[11px] text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}

export { isValidPhoneNumber };
