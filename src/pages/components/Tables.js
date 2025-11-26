import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Table, Image, Container } from '@themesberg/react-bootstrap';

import Documentation from "../../components/Documentation";

import USAFlag from "../../assets/img/flags/united-states-of-america.svg";
import CanadaFlag from "../../assets/img/flags/canada.svg";
import UKFlag from "../../assets/img/flags/united-kingdom.svg";
import FranceFlag from "../../assets/img/flags/france.svg";
import JapanFlag from "../../assets/img/flags/japan.svg";
import GermanyFlag from "../../assets/img/flags/germany.svg";

const TablesPage = () => {
  return (
    <article>
      <Container className="px-0">
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center py-4">
          <Col className="d-block mb-4 mb-md-0">
            <h1 className="h2">Tables</h1>
            <p className="mb-0">
              Use tables to show more complex amount of data.
            </p>
          </Col>
        </Row>

        <Documentation
          title="Example"
          description={
            <>
              <p>The <code>&lt;Table&gt;</code> component can be used to show more complex amounts of data.</p>
              <p>The <code>&lt;TableRow&gt;</code> child components define the table rows.</p>
            </>
          }
          scope={{ Image, Table, FontAwesomeIcon, faAngleDown, faAngleUp, USAFlag, CanadaFlag, UKFlag, FranceFlag, JapanFlag, GermanyFlag }}
          imports={`import { Image, Table } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

import USAFlag from "src/assets/img/flags/united-states-of-america.svg";
import CanadaFlag from "src/assets/img/flags/canada.svg";
import UKFlag from "src/assets/img/flags/united-kingdom.svg";
import FranceFlag from "src/assets/img/flags/france.svg";
import JapanFlag from "src/assets/img/flags/japan.svg";
import GermanyFlag from "src/assets/img/flags/germany.svg";`}
          example={`<Table>
  <thead className="thead-light">
    <tr>
      <th className="border-0">Country</th>
      <th className="border-0">All</th>
      <th className="border-0">All Change</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="border-0">
        <a href="#USA" className="d-flex align-items-center">
          <Image roundedCircle src={USAFlag} className="me-2 image image-small" />
          <span className="h6">United States</span>
        </a>
      </td>
      <td className="border-0 fw-bold">106</td>
      <td className="border-0 text-danger">
        <FontAwesomeIcon icon={faAngleDown} className="me-1" />
        <span className="fw-bold">5</span>
      </td>
    </tr>
    ...
  </tbody>
</Table>`}
        />
      </Container>
    </article>
  );
};

export default TablesPage;
