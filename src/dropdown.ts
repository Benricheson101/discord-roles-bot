import {pronounRoles, otherRoles} from './roles';
import _emojis from '../emojis.json';

type Emojis = {
  [key in
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple'
    | 'headstone'
    | 'male'
    | 'female'
    | 'trans']: string;
};

const emojis: Emojis = _emojis as Emojis;

export const pronounRoleSelector = (userRoles: string[]) => ({
  type: 3,
  custom_id: 'pronoun_roles',
  options: [
    {
      label: 'He/Him',
      value: 'he_him',
      default: userRoles.includes(pronounRoles.he_him),
      description: 'Give yourself the he/him role',
      emoji: {
        name: emojis.male,
      },
    },
    {
      label: 'She/Her',
      value: 'she_her',
      default: userRoles.includes(pronounRoles.she_her),
      description: 'Give yourself the she/her role',
      emoji: {
        name: emojis.female,
      },
    },
    {
      label: 'They/Them',
      value: 'they_them',
      default: userRoles.includes(pronounRoles.they_them),
      description: 'Give yourself the they/them role',
      emoji: {
        name: emojis.trans,
      },
    },
  ],
  placeholder: 'Pronoun Roles',
  max_values: 3,
});

export const colorRoleSelector = {
  type: 3,
  custom_id: 'color_roles',
  options: [
    {
      label: 'Red',
      value: 'red',
      default: false,
      description: 'Give yourself the red role',
      emoji: {
        name: emojis.red,
      },
    },
    {
      label: 'Orange',
      value: 'orange',
      default: false,
      description: 'Give yourself the orange role',
      emoji: {
        name: emojis.orange,
      },
    },
    {
      label: 'Yellow',
      value: 'yellow',
      default: false,
      description: 'Give yourself the yellow role',
      emoji: {
        name: emojis.yellow,
      },
    },
    {
      label: 'Green',
      value: 'green',
      default: false,
      description: 'Give yourself the green role',
      emoji: {
        name: emojis.green,
      },
    },
    {
      label: 'Blue',
      value: 'blue',
      default: false,
      description: 'Give yourself the blue role',
      emoji: {
        name: emojis.blue,
      },
    },
    {
      label: 'Purple',
      value: 'purple',
      default: false,
      description: 'Give yourself the purple role',
      emoji: {
        name: emojis.purple,
      },
    },
  ],
  placeholder: 'Color Roles',
  max_values: 1,
};

export const otherRoleSelector = (userRoles: string[]) => ({
  type: 3,
  custom_id: 'other_roles',
  options: [
    {
      label: 'Downtime',
      value: 'downtime',
      default: userRoles.includes(otherRoles.downtime),
      description: "Be notified when Ben's bots experience downtime.",
      emoji: {
        name: emojis.headstone,
      },
    },
  ],
  placeholder: 'Other Roles',
  max_values: 1,
});

export const roleTypeButtons = (sel = 'pronouns') => [
  {
    type: 2,
    style: 1,
    disabled: sel === 'pronouns',
    label: 'Pronouns',
    custom_id: 'pronouns',
  },
  // {
  //   type: 2,
  //   disabled: sel === 'colors',
  //   style: 1,
  //   label: 'Colors',
  //   custom_id: 'colors',
  // },
  {
    type: 2,
    style: 1,
    disabled: sel === 'other',
    label: 'Other',
    custom_id: 'other',
  },
];
