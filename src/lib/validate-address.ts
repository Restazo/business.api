import axios from "axios";

import { AddressSchema } from "../schemas/schemas.js";

import {
  Address,
  ExtendedAddress,
  AddressValidationResult,
} from "../schemas/types.js";

export const validateAddress = async (
  address: Address
): Promise<AddressValidationResult> => {
  const googleAddressValidationUrl = process.env.GOOGLE_ADDRESS_VALIDATION_URL;
  try {
    // Validate fields
    const validatedFields = AddressSchema.safeParse(address);

    if (!validatedFields.success) {
      return null;
    }

    const { address_line, city, postal_code, country_code } =
      validatedFields.data;

    // Send request to Google API

    const formattedData = {
      address: {
        regionCode: country_code,
        addressLines: [`${address_line}, ${city}, ${postal_code}`],
      },
    };

    const response = await axios.post(
      googleAddressValidationUrl,
      formattedData
    );

    if (!response.data && response.data.status !== "OK") {
      console.log("Error fetching google address validation API");
      return null;
    }

    // Logic to check if the address is valid
    // Basically I am relying on the validationGranularity field. Additional checking can also be added here.

    const result = response.data.result;
    const verdict = result.verdict;

    if (
      verdict.validationGranularity !== "PREMISE" &&
      verdict.validationGranularity !== "SUB_PREMISE"
    ) {
      return null;
    }

    const latitude: number = result.geocode.location.latitude;
    const longitude: number = result.geocode.location.longitude;

    const extendedAddress: ExtendedAddress = {
      ...validatedFields.data,
      latitude,
      longitude,
    };

    return { data: extendedAddress };
  } catch (error) {
    console.error(error);
    return null;
  }
};
