import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  NativeModules,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ViewPropTypes,
  TextInput,
  findNodeHandle,
} from "react-native";

import CreditCard from "./CardView";
import CCInput from "./CCInput";
import { InjectedProps } from "./connectToState";

const s = StyleSheet.create({
  container: {},
  creditCardContainer: {
    alignItems: "center",
  },
  form: {
    paddingLeft: 20,
    paddingRight: 20,
    marginVertical: 20,
    paddingBottom: 10,
  },
  Title: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 2,
    fontSize: 17,
    fontWeight: "bold",
    color: "#313131",
  },
  inputContainer: {
    width: "100%",
  },
  inputLabel: {
    fontWeight: "bold",
  },
  input: {
    height: 40,
  },
});

const CVC_INPUT_WIDTH = 70;
const CARD_NUMBER_INPUT_WIDTH = Dimensions.get("window").width * 0.5;
const NAME_INPUT_WIDTH = CARD_NUMBER_INPUT_WIDTH;
const PREVIOUS_FIELD_OFFSET = 40;
const POSTAL_CODE_INPUT_WIDTH = 120;

export default class CreditCardInput extends Component {
  static propTypes = {
    ...InjectedProps,
    labels: PropTypes.object,
    placeholders: PropTypes.object,

    labelStyle: Text.propTypes.style,
    inputStyle: TextInput.propTypes.style,
    inputContainerStyle: ViewPropTypes.style,

    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    cardImageFront: PropTypes.number,
    cardImageBack: PropTypes.number,
    cardScale: PropTypes.number,
    cardFontFamily: PropTypes.string,
    cardBrandIcons: PropTypes.object,

    allowScroll: PropTypes.bool,
    cardTitle: PropTypes.string,

    additionalInputsProps: PropTypes.objectOf(
      PropTypes.shape(TextInput.propTypes)
    ),

    scrollViewProps: PropTypes.object,
  };

  static defaultProps = {
    cardViewSize: {},
    labels: {
      name: "NAME",
      number: "CARD NUMBER",
      expiry: "EXPIRY",
      cvc: "CVC/CCV",
      postalCode: "POSTAL CODE",
    },
    placeholders: {
      name: "Full name",
      number: "1234 5678 1234 5678",
      expiry: "MM/YY",
      cvc: "CVC",
      postalCode: "34567",
    },
    validColor: "",
    invalidColor: "red",
    placeholderColor: "gray",
    allowScroll: false,
    cardTitle: "Add Card Details",
    additionalInputsProps: {},
  };

  componentDidMount = () => this._focus(this.props.focused);

  componentDidUpdate(prevProps) {
    if (prevProps.focused !== this.props.focused)
      this._focus(this.props.focused);
  }

  _focus = (field) => {
    if (!field) return;

    const scrollResponder = this.refs.Form.getScrollResponder();
    const nodeHandle = findNodeHandle(this.refs[field]);

    NativeModules.UIManager.measureLayoutRelativeToParent(
      nodeHandle,
      (e) => {
        throw e;
      },
      (x) => {
        scrollResponder.scrollTo({
          x: Math.max(x - PREVIOUS_FIELD_OFFSET, 0),
          animated: true,
        });
        this.refs[field].focus();
      }
    );
  };

  _inputProps = (field) => {
    const {
      inputStyle,
      labelStyle,
      validColor,
      invalidColor,
      placeholderColor,
      placeholders,
      labels,
      values,
      status,
      onFocus,
      onChange,
      onBecomeEmpty,
      onBecomeValid,
      additionalInputsProps,
    } = this.props;

    return {
      inputStyle: [s.input, inputStyle],
      labelStyle: [s.inputLabel, labelStyle],
      validColor,
      invalidColor,
      placeholderColor,
      ref: field,
      field,

      label: labels[field],
      placeholder: placeholders[field],
      value: values[field],
      status: status[field],

      onFocus,
      onChange,
      onBecomeEmpty,
      onBecomeValid,

      additionalInputProps: additionalInputsProps[field],
    };
  };

  render() {
    const {
      cardImageFront,
      cardImageBack,
      inputContainerStyle,
      values: { number, expiry, cvc, name, type },
      focused,
      placeholderCardView,
      allowScroll,
      cardTitle,
      requiresName,
      requiresCVC,
      requiresPostalCode,
      cardScale,
      cardFontFamily,
      cardBrandIcons,
      scrollViewProps,
    } = this.props;

    return (
      <View style={s.container}>
        <View style={s.creditCardContainer}>
          <CreditCard
            focused={focused}
            brand={type}
            scale={cardScale}
            fontFamily={cardFontFamily}
            imageFront={cardImageFront}
            imageBack={cardImageBack}
            customIcons={cardBrandIcons}
            placeholder={placeholderCardView}
            name={requiresName ? name : " "}
            number={number}
            expiry={expiry}
            cvc={cvc}
          />
        </View>
        <ScrollView
          ref="Form"
          horizontal={false}
          keyboardShouldPersistTaps="always"
          scrollEnabled={allowScroll}
          showsHorizontalScrollIndicator={false}
          style={s.form}
          {...scrollViewProps}
        >
          <Text style={[s.Title]}>{cardTitle ? cardTitle : ""}</Text>
          {requiresName && (
            <CCInput
              {...this._inputProps("name")}
              containerStyle={[s.inputContainer, { width: NAME_INPUT_WIDTH }]}
            />
          )}
          <CCInput
            {...this._inputProps("number")}
            keyboardType="numeric"
            containerStyle={[
              s.inputContainer,
              { width: CARD_NUMBER_INPUT_WIDTH },
            ]}
            additionalInputProps={{
              maxLength: 19,
            }}
          />
          <CCInput
            {...this._inputProps("expiry")}
            keyboardType="numeric"
            containerStyle={[s.inputContainer]}
          />
          {requiresCVC && (
            <CCInput
              {...this._inputProps("cvc")}
              keyboardType="numeric"
              containerStyle={[{ width: CVC_INPUT_WIDTH }]}
            />
          )}
          {requiresPostalCode && (
            <CCInput
              {...this._inputProps("postalCode")}
              containerStyle={[
                s.inputContainer,
                { width: POSTAL_CODE_INPUT_WIDTH },
              ]}
            />
          )}
        </ScrollView>
      </View>
    );
  }
}
