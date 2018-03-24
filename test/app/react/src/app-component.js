import React from 'react';

import F7Badge from '../../../component-library/dist/react/components/badge';
import F7BlockTitle from '../../../component-library/dist/react/components/block-title';
import F7Block from '../../../component-library/dist/react/components/block';
import F7BlockHeader from '../../../component-library/dist/react/components/block-header';
import F7BlockFooter from '../../../component-library/dist/react/components/block-footer';
import F7Card from '../../../component-library/dist/react/components/card';
import F7CardHeader from '../../../component-library/dist/react/components/card-header';
import F7CardFooter from '../../../component-library/dist/react/components/card-footer';
import F7CardContent from '../../../component-library/dist/react/components/card-content';
import F7Row from '../../../component-library/dist/react/components/row';
import F7Col from '../../../component-library/dist/react/components/col';
import F7Chip from '../../../component-library/dist/react/components/chip';
import F7Icon from '../../../component-library/dist/react/components/icon';
import F7AccordionItem from '../../../component-library/dist/react/components/accordion-item';
import F7AccordionToggle from '../../../component-library/dist/react/components/accordion-toggle';
import F7AccordionContent from '../../../component-library/dist/react/components/accordion-content';
import F7Accordion from '../../../component-library/dist/vue/components/accordion';

class App extends React.Component {
  get $theme() {
    return {}
  }
  render() {
    return (
      <div id="#app">
        <h1>Block</h1>
        <p>This paragraph is outside of content block. Not cool, but useful for any custom elements with custom styling.</p>

        <F7Block className="test" id="test2">
          <p>Here comes paragraph within content block. Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
        </F7Block>

        <F7Block strong>
          <p>Here comes another text block with additional "block-strong" class. Praesent nec imperdiet diam. Maecenas vel lectus porttitor, consectetur magna nec, viverra sem. Aliquam sed risus dolor. Morbi tincidunt ut libero id sodales. Integer blandit varius nisi quis consectetur. </p>
        </F7Block>

        <F7BlockTitle>Block title</F7BlockTitle>
        <F7Block>
          <p>Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
        </F7Block>

        <F7BlockTitle>Another ultra long content block title</F7BlockTitle>
        <F7Block strong>
          <p>Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
        </F7Block>

        <F7BlockTitle>Inset</F7BlockTitle>
        <F7Block strong inset>
          <p>Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
        </F7Block>

        <F7BlockTitle>Tablet Inset</F7BlockTitle>
        <F7Block strong tablet-inset>
          <p>Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
        </F7Block>

        <F7BlockTitle>With Header & Footer</F7BlockTitle>
        <F7Block>
          <F7BlockHeader>Block Header</F7BlockHeader>
          <p>Here comes paragraph within content block. Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
          <F7BlockFooter>Block Footer</F7BlockFooter>
        </F7Block>

        <F7BlockHeader>Block Header</F7BlockHeader>
        <F7Block>
          <p>Here comes paragraph within content block. Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
        </F7Block>
        <F7BlockFooter>Block Footer</F7BlockFooter>

        <F7Block strong>
          <F7BlockHeader>Block Header</F7BlockHeader>
          <p>Here comes paragraph within content block. Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
          <F7BlockFooter>Block Footer</F7BlockFooter>
        </F7Block>

        <F7BlockHeader>Block Header</F7BlockHeader>
        <F7Block strong>
          <p>Here comes paragraph within content block. Donec et nulla auctor massa pharetra adipiscing ut sit amet sem. Suspendisse molestie velit vitae mattis tincidunt. Ut sit amet quam mollis, vulputate turpis vel, sagittis felis. </p>
        </F7Block>
        <F7BlockFooter>Block Footer</F7BlockFooter>

        <h1>Card</h1>
        <F7Block>
          <p>Cards are a great way to contain and organize your information, especially when combined with List Views. Cards can contain unique related data, like for example photos, text or links about a particular subject. Cards are typically an entry point to more complex and detailed information.</p>
        </F7Block>
        <F7BlockTitle>Simple Cards</F7BlockTitle>
        <F7Card
          content="This is a simple card with plain text, but cards can also contain their own header, footer, list view, image, or any other element."
        ></F7Card>
        <F7Card
          title="Card header"
          content="Card with header and footer. Card headers are used to display card titles and footers for additional information or just for custom actions."
          footer="Card footer"
        ></F7Card>
        <F7Card
          content="Another card. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse feugiat sem est, non tincidunt ligula volutpat sit amet. Mauris aliquet magna justo. "
        ></F7Card>

        <F7BlockTitle>Styled Cards</F7BlockTitle>
        <F7Card className="demo-card-header-pic">
          <F7CardHeader
            className="no-border"
            valign="bottom"
            style={{backgroundImage:'url(http://lorempixel.com/1000/600/nature/3/)'}}
          >Journey To Mountains</F7CardHeader>
          <F7CardContent>
            <p className="date">Posted on January 21, 2015</p>
            <p>Quisque eget vestibulum nulla. Quisque quis dui quis ex ultricies efficitur vitae non felis. Phasellus quis nibh hendrerit...</p>
          </F7CardContent>
          <F7CardFooter>
            {/* <f7-link>Like</f7-link>
            <f7-link>Read more</f7-link> */}
          </F7CardFooter>
        </F7Card>
        <F7Card className="demo-card-header-pic">
          <F7CardHeader
            className="no-border"
            valign="bottom"
            style={{backgroundImage:'url(http://lorempixel.com/1000/600/people/6/)'}}
            >Journey To Mountains</F7CardHeader>
          <F7CardContent>
            <p className="date">Posted on January 21, 2015</p>
            <p>Quisque eget vestibulum nulla. Quisque quis dui quis ex ultricies efficitur vitae non felis. Phasellus quis nibh hendrerit...</p>
          </F7CardContent>
          <F7CardFooter>
            {/* <f7-link>Like</f7-link>
            <f7-link>Read more</f7-link> */}
          </F7CardFooter>
        </F7Card>

        <F7BlockTitle>Facebook Cards</F7BlockTitle>
        <F7Card className="demo-facebook-card">
          <F7CardHeader className="no-border">
            <div className="demo-facebook-avatar"><img src="http://lorempixel.com/68/68/people/1/" width="34" height="34"/></div>
            <div className="demo-facebook-name">John Doe</div>
            <div className="demo-facebook-date">Monday at 3:47 PM</div>
          </F7CardHeader>
          <F7CardContent padding={false}>
            <img src="http://lorempixel.com/1000/700/nature/8/" width="100%"/>
          </F7CardContent>
          <F7CardFooter className="no-border">
            {/* <f7-link>Like</f7-link>
            <f7-link>Comment</f7-link>
            <f7-link>Share</f7-link> */}
          </F7CardFooter>
        </F7Card>
        <F7Card className="demo-facebook-card">
          <F7CardHeader className="no-border">
            <div className="demo-facebook-avatar"><img src="http://lorempixel.com/68/68/people/1/" width="34" height="34"/></div>
            <div className="demo-facebook-name">John Doe</div>
            <div className="demo-facebook-date">Monday at 2:15 PM</div>
          </F7CardHeader>
          <F7CardContent>
            <p>What a nice photo i took yesterday!</p><img src="http://lorempixel.com/1000/700/nature/8/" width="100%"/>
            <p className="likes">Likes: 112 &nbsp;&nbsp; Comments: 43</p>
          </F7CardContent>
          <F7CardFooter className="no-border">
            {/* <f7-link>Like</f7-link>
            <f7-link>Comment</f7-link>
            <f7-link>Share</f7-link> */}
          </F7CardFooter>
        </F7Card>

        <F7BlockTitle>Cards With List View</F7BlockTitle>
        <F7Card>
          <F7CardContent padding={false}>
            {/* <f7-list>
              <f7-list-item link="#">Link 1</f7-list-item>
              <f7-list-item link="#">Link 2</f7-list-item>
              <f7-list-item link="#">Link 3</f7-list-item>
              <f7-list-item link="#">Link 4</f7-list-item>
              <f7-list-item link="#">Link 5</f7-list-item>
            </f7-list> */}
          </F7CardContent>
        </F7Card>
        <F7Card title="New Reelases">
          <F7CardContent padding={false}>
            {/* <f7-list medial-list>
              <f7-list-item
                title="Yellow Submarine"
                subtitle="Beatles"
              >
                <img slot="media" src="http://lorempixel.com/88/88/fashion/4" width="44"/>
              </f7-list-item>
              <f7-list-item
                title="Don't Stop Me Now"
                subtitle="Queen"
              >
                <img slot="media" src="http://lorempixel.com/88/88/fashion/5" width="44"/>
              </f7-list-item>
              <f7-list-item
                title="Billie Jean"
                subtitle="Michael Jackson"
              >
                <img slot="media" src="http://lorempixel.com/88/88/fashion/6" width="44"/>
              </f7-list-item>
            </f7-list> */}
          </F7CardContent>
          <F7CardFooter>
            <span>January 20, 2015</span>
            <span>5 comments</span>
          </F7CardFooter>
        </F7Card>

        <h1>Grid</h1>
        <F7Block>
          <p>Columns within a row are automatically set to have equal width. Otherwise you can define your column with pourcentage of screen you want.</p>
        </F7Block>
        <F7BlockTitle>Columns with gap</F7BlockTitle>
        <F7Block>
          <F7Row>
            <F7Col>50% (.col)</F7Col>
            <F7Col>50% (.col)</F7Col>
          </F7Row>
          <F7Row>
            <F7Col>25% (.col)</F7Col>
            <F7Col>25% (.col)</F7Col>
            <F7Col>25% (.col)</F7Col>
            <F7Col>25% (.col)</F7Col>
          </F7Row>
          <F7Row>
            <F7Col>33% (.col)</F7Col>
            <F7Col>33% (.col)</F7Col>
            <F7Col>33% (.col)</F7Col>
          </F7Row>
          <F7Row>
            <F7Col>20% (.col)</F7Col>
            <F7Col>20% (.col)</F7Col>
            <F7Col>20% (.col)</F7Col>
            <F7Col>20% (.col)</F7Col>
            <F7Col>20% (.col)</F7Col>
          </F7Row>
          <F7Row>
            <F7Col width="33">33% (.col-33)</F7Col>
            <F7Col width="66">66% (.col-66)</F7Col>
          </F7Row>
          <F7Row>
            <F7Col width="25">25% (.col-25)</F7Col>
            <F7Col width="25">25% (.col-25)</F7Col>
            <F7Col width="50">50% (.col-50)</F7Col>
          </F7Row>
          <F7Row>
            <F7Col width="75">75% (.col-75)</F7Col>
            <F7Col width="25">25% (.col-25)</F7Col>
          </F7Row>
          <F7Row>
            <F7Col width="80">80% (.col-80)</F7Col>
            <F7Col width="20">20% (.col-20)</F7Col>
          </F7Row>
        </F7Block>
        <F7BlockTitle>No gap between columns</F7BlockTitle>
        <F7Block>
          <F7Row noGap>
            <F7Col>50% (.col)</F7Col>
            <F7Col>50% (.col)</F7Col>
          </F7Row>
          <F7Row noGap>
            <F7Col>25% (.col)</F7Col>
            <F7Col>25% (.col)</F7Col>
            <F7Col>25% (.col)</F7Col>
            <F7Col>25% (.col)</F7Col>
          </F7Row>
          <F7Row noGap>
            <F7Col>33% (.col)</F7Col>
            <F7Col>33% (.col)</F7Col>
            <F7Col>33% (.col)</F7Col>
          </F7Row>
          <F7Row noGap>
            <F7Col>20% (.col)</F7Col>
            <F7Col>20% (.col)</F7Col>
            <F7Col>20% (.col)</F7Col>
            <F7Col>20% (.col)</F7Col>
            <F7Col>20% (.col)</F7Col>
          </F7Row>
          <F7Row noGap>
            <F7Col width="33">33% (.col-33)</F7Col>
            <F7Col width="66">66% (.col-66)</F7Col>
          </F7Row>
          <F7Row noGap>
            <F7Col width="25">25% (.col-25)</F7Col>
            <F7Col width="25">25% (.col-25)</F7Col>
            <F7Col width="50">50% (.col-50)</F7Col>
          </F7Row>
          <F7Row noGap>
            <F7Col width="75">75% (.col-75)</F7Col>
            <F7Col width="25">25% (.col-25)</F7Col>
          </F7Row>
          <F7Row noGap>
            <F7Col width="80">80% (.col-80)</F7Col>
            <F7Col width="20">20% (.col-20)</F7Col>
          </F7Row>
        </F7Block>

        <F7BlockTitle>Nested</F7BlockTitle>
        <F7Block>
          <F7Row>
            <F7Col>50% (.col)
              <F7Row>
                <F7Col>50% (.col)</F7Col>
                <F7Col>50% (.col)</F7Col>
              </F7Row>
            </F7Col>
            <F7Col>50% (.col)
              <F7Row>
                <F7Col width="33">33% (.col-33)</F7Col>
                <F7Col width="66">66% (.col-66)</F7Col>
              </F7Row>
            </F7Col>
          </F7Row>
        </F7Block>

        <F7BlockTitle>Responsive Grid</F7BlockTitle>
        <F7Block>
          <p>Grid cells have different size on Phone/Tablet</p>
          <F7Row tag="div">
            <F7Col tag="p" width="100" tabletWidth="50">.col-100.tablet-50</F7Col>
            <F7Col width="100" tabletWidth="50">.col-100.tablet-50</F7Col>
          </F7Row>
          <F7Row>
            <F7Col width="50" tabletWidth="25">.col-50.tablet-25</F7Col>
            <F7Col width="50" tabletWidth="25">.col-50.tablet-25</F7Col>
            <F7Col width="50" tabletWidth="25">.col-50.tablet-25</F7Col>
            <F7Col width="50" tabletWidth="25">.col-50.tablet-25</F7Col>
          </F7Row>
          <F7Row>
            <F7Col width="100" tabletWidth="40">.col-100.tablet-40</F7Col>
            <F7Col width="50" tabletWidth="60">.col-50.tablet-60</F7Col>
            <F7Col width="50" tabletWidth="66">.col-50.tablet-66</F7Col>
            <F7Col width="100" tabletWidth="33">.col-100.tablet-33</F7Col>
          </F7Row>
        </F7Block>

        <h1>Chips</h1>
        <F7BlockTitle>Chips With Text</F7BlockTitle>
        <F7Block strong>
          <F7Chip text="Example Chip"></F7Chip>
          <F7Chip text="Another Chip"></F7Chip>
          <F7Chip text="One More Chip"></F7Chip>
          <F7Chip text="Fourth Chip"></F7Chip>
          <F7Chip text="Last One"></F7Chip>
        </F7Block>
        <F7BlockTitle>Icon Chips</F7BlockTitle>
        <F7Block strong>
          <F7Chip text="Add Contact" mediaBgColor={this.$theme.md ? 'blue' : undefined}>
            <F7Icon slot="media" ifIos="f7:add_round" ifMd="material:add_circle"></F7Icon>
          </F7Chip>
          <F7Chip text="London" mediaBgColor={this.$theme.md ? 'green' : undefined}>
            <F7Icon slot="media" ifIos="f7:compass" ifMd="material:location_on"></F7Icon>
          </F7Chip>
          <F7Chip text="John Doe" mediaBgColor={this.$theme.md ? 'red' : undefined}>
            <F7Icon slot="media" ifIos="f7:person" ifMd="material:person"></F7Icon>
          </F7Chip>
        </F7Block>
        <F7BlockTitle>Contact Chips</F7BlockTitle>
        <F7Block strong>
          <F7Chip text="Jane Doe">
            <img slot="media" src="http://lorempixel.com/100/100/people/9/"/>
          </F7Chip>
          <F7Chip text="John Doe">
            <img slot="media" src="http://lorempixel.com/100/100/people/3/"/>
          </F7Chip>
          <F7Chip text="Adam Smith">
            <img slot="media" src="http://lorempixel.com/100/100/people/7/"/>
          </F7Chip>
          <F7Chip text="Jennifer" mediaBgColor="pink" media="J"></F7Chip>
          <F7Chip text="Chris" mediaBgColor="yellow" mediaTextColor="black" media="C"></F7Chip>
          <F7Chip text="Kate" mediaBgColor="red" media="K"></F7Chip>
        </F7Block>
        <F7BlockTitle>Deletable Chips / Tags</F7BlockTitle>
        <F7Block strong>
          <F7Chip text="Example Chip" deleteable onDelete={this.deleteChip}></F7Chip>
          <F7Chip text="Chris" media="C" mediaBgColor="orange" textColor="black" deleteable onDelete={this.deleteChip}></F7Chip>
          <F7Chip text="Jane Doe" deleteable onDelete={this.deleteChip}>
            <img slot="media" src="http://lorempixel.com/100/100/people/9/"/>
          </F7Chip>
          <F7Chip text="One More Chip" deleteable onDelete={this.deleteChip}></F7Chip>
          <F7Chip text="Jennifer" mediaBgColor="pink" media="J" deleteable onDelete={this.deleteChip}></F7Chip>
          <F7Chip text="Adam Smith" deleteable onDelete={this.deleteChip}>
            <img slot="media" src="http://lorempixel.com/100/100/people/7/"/>
          </F7Chip>
        </F7Block>
        <F7BlockTitle>Color Chips</F7BlockTitle>
        <F7Block strong>
          <F7Chip text="Red Chip" color="red"></F7Chip>
          <F7Chip text="Green Chip" color="green"></F7Chip>
          <F7Chip text="Blue Chip" color="blue"></F7Chip>
          <F7Chip text="Orange Chip" color="orange"></F7Chip>
          <F7Chip text="Pink Chip" color="pink"></F7Chip>
        </F7Block>

        <h1>Accordion</h1>
        <F7BlockTitle>Custom Collapsible</F7BlockTitle>
        <F7Block inner accordion-list>
          {[1,2,3].map((key) => (
            <F7AccordionItem key={key} onAccordionOpened={this.onAccordionOpened} onAccordionClosed={this.onAccordionClosed}>
              <F7AccordionToggle><b>Item {key}</b></F7AccordionToggle>
              <F7AccordionContent>Content {key}</F7AccordionContent>
            </F7AccordionItem>
          ))}
        </F7Block>
      </div>
    );
  }
  deleteChip() {
    alert('Delete chip!');
  }
  onAccordionOpened() {
    alert('Accordion opened');
  }
  onAccordionClosed() {
    alert('Accordion closed');
  }
}
export default App;