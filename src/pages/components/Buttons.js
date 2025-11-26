import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, faThumbsUp, faAngleDown, faAngleUp, 
  faAngleLeft, faAngleRight 
} from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Button, Container, Dropdown, ButtonGroup } from '@themesberg/react-bootstrap';

import Documentation from "../../components/Documentation";

const ButtonsPage = () => {
  return (
    <article>
      <Container className="px-0">
        <Row className="d-flex flex-wrap flex-md-nowrap align-items-center py-4">
          <Col className="d-block mb-4 mb-md-0">
            <h1 className="h2">Buttons</h1>
            <p className="mb-0">
              Use custom button styles for actions in forms, dialogs, and more
              with support for multiple sizes, states, and more.
            </p>
          </Col>
        </Row>

        <Documentation
          title="Example"
          description={
            <p>
              The <code>&lt;Button&gt;</code> component is an important part of the UI. 
              You can update button appearance using the <code>variant</code> attribute.
            </p>
          }
          scope={{ Button }}
          imports={`import { Button } from '@themesberg/react-bootstrap';`}
          example={`<React.Fragment>
  <Button variant="primary" className="m-1">Primary</Button>
  <Button variant="secondary" className="m-1">Secondary</Button>
  <Button variant="tertiary" className="m-1">Tertiary</Button>
  <Button variant="info" className="m-1">Info</Button>
  <Button variant="success" className="m-1">Success</Button>
  <Button variant="warning" className="m-1">Warning</Button>
  <Button variant="danger" className="m-1">Danger</Button>
  <Button variant="dark" className="m-1">Dark</Button>
  <Button variant="gray" className="m-1">Gray</Button>
  <Button variant="light" className="m-1">Light</Button>
  <Button variant="white" className="m-1">White</Button>
</React.Fragment>`}
        />

        <Documentation
          title="Button sizing"
          description={
            <p>
              Buttons come in three sizes: <code>sm</code>, default, and <code>lg</code>.
            </p>
          }
          scope={{ Button }}
          imports={`import { Button } from '@themesberg/react-bootstrap';`}
          example={`<React.Fragment>
  <Button variant="primary" size="sm" className="me-1">Small</Button>
  <Button variant="primary" className="me-1">Regular</Button>
  <Button variant="primary" size="lg" className="me-1">Large Button</Button>
</React.Fragment>`}
        />

        <Documentation
          title="Buttons with outline"
          description={
            <p>
              Use outline variants for buttons with border only.
            </p>
          }
          scope={{ Button }}
          imports={`import { Button } from '@themesberg/react-bootstrap';`}
          example={`<React.Fragment>
  <Button variant="outline-primary" className="m-1">Primary</Button>
  <Button variant="outline-secondary" className="m-1">Secondary</Button>
  <Button variant="outline-tertiary" className="m-1">Tertiary</Button>
  <Button variant="outline-info" className="m-1">Info</Button>
  <Button variant="outline-success" className="m-1">Success</Button>
  <Button variant="outline-danger" className="m-1">Danger</Button>
  <Button variant="outline-dark" className="m-1">Dark</Button>
  <Button variant="outline-gray" className="m-1">Gray</Button>
</React.Fragment>`}
        />

        <Documentation
          title="Link buttons"
          description={
            <p>
              Use <code>bsPrefix="text"</code> to create text-only buttons.
            </p>
          }
          scope={{ Button }}
          imports={`import { Button } from '@themesberg/react-bootstrap';`}
          example={`<React.Fragment>
  <Button bsPrefix="text" href="#primary" variant="primary" className="m-3">Primary</Button>
  <Button bsPrefix="text" href="#secondary" variant="secondary" className="m-3">Secondary</Button>
  <Button bsPrefix="text" href="#tertiary" variant="tertiary" className="m-3">Tertiary</Button>
  <Button bsPrefix="text" href="#info" variant="info" className="m-3">Info</Button>
  <Button bsPrefix="text" href="#success" variant="success" className="m-3">Success</Button>
  <Button bsPrefix="text" href="#danger" variant="danger" className="m-3">Danger</Button>
  <Button bsPrefix="text" href="#dark" variant="dark" className="m-3">Dark</Button>
  <Button bsPrefix="text" href="#gray" variant="gray" className="m-3">Gray</Button>
</React.Fragment>`}
        />

        <Documentation
          title="Buttons with icon"
          description={
            <p>
              You can include icons inside buttons using FontAwesome.
            </p>
          }
          scope={{ Button, FontAwesomeIcon, faHeart, faThumbsUp }}
          imports={`import { Button } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faThumbsUp } from "@fortawesome/free-solid-svg-icons";`}
          example={`<React.Fragment>
  <Button variant="outline-primary" className="m-1">
    <FontAwesomeIcon icon={faHeart} className="me-2" /> Primary
  </Button>
  <Button variant="outline-secondary" className="m-1">
    <FontAwesomeIcon icon={faThumbsUp} className="me-2" /> Secondary
  </Button>
</React.Fragment>`}
        />

        <Documentation
          title="Block level Buttons"
          description={
            <p>
              Use <code>w-100</code> class to make buttons full width.
            </p>
          }
          scope={{ Button }}
          imports={`import { Button } from '@themesberg/react-bootstrap';`}
          example={`<Button variant="secondary" className="w-100">Block</Button>`}
        />

        <Documentation
          title="Disabled state"
          description={
            <p>
              Add <code>disabled</code> attribute to disable buttons.
            </p>
          }
          scope={{ Button }}
          imports={`import { Button } from '@themesberg/react-bootstrap';`}
          example={`<React.Fragment>
  <Button disabled variant="primary" className="mb-2 me-2">Primary button</Button>
  <Button disabled variant="secondary" className="mb-2 me-2">Button</Button>
</React.Fragment>`}
        />

        {/* ---------- Dropdown Buttons ---------- */}

        <Documentation
          title="Dropdown buttons"
          description={
            <>
              <p>Use Dropdown + Button to show menus.</p>
            </>
          }
          scope={{ Button, Dropdown, ButtonGroup, FontAwesomeIcon, faAngleDown }}
          imports={`import { Button, Dropdown, ButtonGroup } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";`}
          example={`<React.Fragment>
  <Dropdown as={ButtonGroup} className="me-2 mb-2">
    <Button variant="primary">Primary</Button>

    <Dropdown.Toggle split variant="primary">
      <FontAwesomeIcon icon={faAngleDown} className="dropdown-arrow" />
    </Dropdown.Toggle>

    <Dropdown.Menu>
      <Dropdown.Item>Action</Dropdown.Item>
      <Dropdown.Item>Another action</Dropdown.Item>
      <Dropdown.Item>Something else here</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item>Separated link</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>

  <Dropdown as={ButtonGroup} className="mb-2 me-2">
    <Dropdown.Toggle split variant="tertiary">
      <FontAwesomeIcon icon={faAngleDown} className="dropdown-arrow" />
    </Dropdown.Toggle>

    <Dropdown.Menu>
      <Dropdown.Item>Action</Dropdown.Item>
      <Dropdown.Item>Another action</Dropdown.Item>
      <Dropdown.Item>Something else here</Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item>Separated link</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
</React.Fragment>`}
        />

        {/* ---------- Dropdown Sizing ---------- */}

        <Documentation
          title="Dropdown sizing"
          description={
            <p>You can size dropdown buttons using <code>size</code> attribute.</p>
          }
          scope={{ Button, Dropdown, ButtonGroup, FontAwesomeIcon, faAngleDown }}
          imports={`import { Button, Dropdown, ButtonGroup } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";`}
          example={`<React.Fragment>
  <Dropdown as={ButtonGroup} className="me-2 mb-2">
    <Button size="sm" variant="primary">Small</Button>
    <Dropdown.Toggle split variant="primary">
      <FontAwesomeIcon icon={faAngleDown} />
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Item>Action</Dropdown.Item>
      <Dropdown.Item>Another action</Dropdown.Item>
      <Dropdown.Item>More</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>

  <Dropdown as={ButtonGroup} className="me-2 mb-2">
    <Button variant="secondary">Default</Button>
    <Dropdown.Toggle split variant="secondary">
      <FontAwesomeIcon icon={faAngleDown} />
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Item>Action</Dropdown.Item>
      <Dropdown.Item>Another action</Dropdown.Item>
      <Dropdown.Item>More</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>

  <Dropdown as={ButtonGroup} className="me-2 mb-2">
    <Button size="lg" variant="tertiary">Large</Button>
    <Dropdown.Toggle split variant="tertiary">
      <FontAwesomeIcon icon={faAngleDown} />
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Item>Action</Dropdown.Item>
      <Dropdown.Item>Another</Dropdown.Item>
      <Dropdown.Item>More</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
</React.Fragment>`}
        />

        {/* ---------- Dropdown Direction ---------- */}

        <Documentation
          title="Dropdown direction"
          description={
            <p>
              Change dropdown opening direction using <code>direction</code> prop.
            </p>
          }
          scope={{ Button, Dropdown, ButtonGroup, FontAwesomeIcon, faAngleDown, faAngleUp, faAngleLeft, faAngleRight }}
          imports={`import { Button, Dropdown, ButtonGroup } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";`}
          example={`<React.Fragment>
  <Dropdown direction="up" as={ButtonGroup} className="me-2 mb-2">
    <Button size="sm" variant="primary">Up</Button>
    <Dropdown.Toggle split variant="primary">
      <FontAwesomeIcon icon={faAngleUp} />
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Item>Action</Dropdown.Item>
      <Dropdown.Item>Another action</Dropdown.Item>
      <Dropdown.Item>More</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>

  <Dropdown direction="right" as={ButtonGroup} className="me-2 mb-2">
    <Button variant="secondary">Right</Button>
    <Dropdown.Toggle split variant="secondary">
      <FontAwesomeIcon icon={faAngleRight} />
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Item>Action</Dropdown.Item>
      <Dropdown.Item>Another</Dropdown.Item>
      <Dropdown.Item>More</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>

  <Dropdown direction="down" as={ButtonGroup} className="me-2 mb-2">
    <Button variant="tertiary">Down</Button>
    <Dropdown.Toggle split variant="tertiary">
      <FontAwesomeIcon icon={faAngleDown} />
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Item>Action</Dropdown.Item>
      <Dropdown.Item>Another</Dropdown.Item>
      <Dropdown.Item>More</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>

  <Dropdown direction="left" as={ButtonGroup} className="me-2 mb-2">
    <Button variant="tertiary">Left</Button>
    <Dropdown.Toggle split variant="tertiary">
      <FontAwesomeIcon icon={faAngleLeft} />
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Item>Action</Dropdown.Item>
      <Dropdown.Item>Another</Dropdown.Item>
      <Dropdown.Item>More</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
</React.Fragment>`}
        />

      </Container>
    </article>
  );
};

export default ButtonsPage;
