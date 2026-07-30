import { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";
import { get, map } from "lodash";

import i18n from "../i18n";
import languages from "../common/languages";

// UI → system mapping (ONLY place where mapping exists)
const languageMap: Record<string, string> = {
  dr: "fa",
  ps: "ps",
  en: "en",
};

const LanguageDropdown = () => {
  const [selectedLang, setSelectedLang] = useState<string>(
    localStorage.getItem("I18N_LANGUAGE") || "ps",
  );

  useEffect(() => {
    const currentLanguage = localStorage.getItem("I18N_LANGUAGE") || "ps";

    setSelectedLang(currentLanguage);
  }, []);

  const changeLanguageAction = (lang: string) => {
    // system language (fa, ps, en)
    const normalized = languageMap[lang] || lang;

    // store UI language (dr, ps, en)
    localStorage.setItem("I18N_LANGUAGE", lang);

    // update i18n system language
    i18n.changeLanguage(normalized);

    // update UI state
    setSelectedLang(lang);
  };

  const [isLanguageDropdown, setIsLanguageDropdown] = useState(false);

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdown(!isLanguageDropdown);
  };

  return (
    <Dropdown
      isOpen={isLanguageDropdown}
      toggle={toggleLanguageDropdown}
      className="ms-1 topbar-head-dropdown header-item language-dropdown"
    >
      <DropdownToggle
        className="topbar-language-pill"
        tag="button"
        type="button"
        aria-label="Change language"
      >
        <span className="language-pill-icon">
          <i className="mdi mdi-web" />
        </span>

        <span className="language-pill-code">
          {get(languages, `${selectedLang}.flag`, selectedLang)}
        </span>
      </DropdownToggle>

      <DropdownMenu end className="language-dropdown-menu">
        {map(Object.keys(languages), (key) => (
          <DropdownItem
            key={key}
            onClick={() => changeLanguageAction(key)}
            active={selectedLang === key}
            className="language-dropdown-option"
          >
            <span className="language-option-code">
              {get(languages, `${key}.flag`, key)}
            </span>

            <span className="language-option-label">
              {get(languages, `${key}.label`, key)}
            </span>

            {selectedLang === key && (
              <i className="mdi mdi-check-circle language-option-check" />
            )}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default LanguageDropdown;
