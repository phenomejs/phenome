|Feature|Vue|React|
| --- | --- | --- |
| Slots | Supported| Not supported, but can pass in ReactElement as props instead.|
| Prop type enforcement | Supported | Supported in separate prop-types library |
| Default prop values |	Defined along with prop types | Supported in "defaultProps" property |
| Element definition options | Templates, JSX, manually calling createElement function | JSX, manually calling createElement function |
| Events | Calling $emit function | No formal events--only supports passing in functions via props |
| Dynamic CSS classes | Rich syntax for dynamic boolean CSS class properties | className property must be a string |
| Stateless functional components | Similar to normal components, except `functional` property set to true | Define a function that accepts props and returns ReactElements |
| Computed properties | Rich computed properties that are cached based on their dependencies | Can be approximated via class getters, but caching would have to be done manually |
| Attributes | Attributes passed into createElement that are not props are separated | createElement accepts only props and does not have a separate "attrs" argument |
| Methods | Methods are defined in a specified area of the script section | Methods are defined on the component class as normal class methods |