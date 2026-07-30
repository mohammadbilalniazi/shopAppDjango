import { useTranslation } from "react-i18next";
import { Container } from "reactstrap";
import { getCurrentDate } from "../utilities/utilFuncs";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t, i18n } = useTranslation();   // also get i18n if needed
  const isRTL = i18n.dir() === "rtl";
  const { gregorian, hijriPersianForDateDropDown } = getCurrentDate();
  const currentYear = isRTL ? hijriPersianForDateDropDown.formatted.split("-")[0] : gregorian.formatted.split("-")[0];

  return (
    <footer className="footer app-footer d-flex align-items-center p-0 shadow-lg">
      <Container fluid>
        <div
          className="d-flex align-items-center justify-content-center flex-wrap text-center fw-medium"
          style={{
            fontSize: "0.92rem",
            lineHeight: "40px",
            gap: "0.75rem",           // replaces mx-3 with logical spacing
          }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Copyright + Year */}
          <span>
            © {currentYear} {t("ministryOfFinance")}
          </span>

          <span className="app-footer-divider">|</span>

          <span>{t("directorateOfTreasury")}</span>

          <span className="app-footer-divider">|</span>

          <span dir="ltr">
            <i className="app-footer-accent mdi mdi-phone me-1" />
            0202924706
          </span>

          <span className="app-footer-divider">|</span>

          <span dir="ltr">
            <i className="app-footer-accent mdi mdi-email-outline me-1" />
            tpms@mof.gov.af
          </span>

          <span className="app-footer-divider">|</span>

          <span style={{ fontSize: "16px" }} dir="ltr" className="fw-bold text-decoration-underline">
            <Link
              to="http://apssrv50.afmis.mof/osticket/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("helpDesk")}
            </Link>
          </span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;